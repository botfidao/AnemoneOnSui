import {
    elizaLogger,
    IAgentRuntime,
    Service,
    ServiceType,
} from "@elizaos/core";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { parseAccount, SuiNetwork } from "../utils";
import { AggregatorClient, Env } from "@cetusprotocol/aggregator-sdk";
import BN from "bn.js";
import { getTokenMetadata, TokenMetadata } from "../tokens";
import { Signer } from "@mysten/sui/cryptography";
import { depositCoin, borrowCoin } from 'navi-sdk/dist/libs/PTB';
import { pool, wUSDC } from 'navi-sdk/dist/address';
import type { Pool, PoolConfig } from "navi-sdk/dist/types";
import {
    Transaction,
    TransactionObjectArgument,
} from "@mysten/sui/transactions";
import { NAVISDKClient } from "navi-sdk";
import { Sui } from 'navi-sdk/dist/address';

const aggregatorURL = "https://api-sui.cetus.zone/router_v2/find_routes";

interface SwapResult {
    success: boolean;
    tx: string;
    message: string;
}

interface NaviPortfolioInfo {
    portfolio: Map<string, { borrowBalance: number; supplyBalance: number }>;
    poolInfo: {
        total_supply?: number;
        total_borrow?: number;
        tokenPrice?: string;
        base_supply_rate?: string;
        base_borrow_rate?: string;
        boosted_supply_rate?: string;
        boosted_borrow_rate?: string;
        max_ltv?: string;
        liquidation_threshold?: string;
    };
    rewards: {
        [key: string]: {
            asset_id: string;
            funds: string;
            available: string;
        };
    };
    healthFactor: number;
}

export class SuiService extends Service {
    static serviceType: ServiceType = ServiceType.TRANSCRIPTION;
    private suiClient: SuiClient;
    private network: SuiNetwork;
    private wallet: Signer;
    private naviClient: NAVISDKClient;

    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.suiClient = new SuiClient({
            url: getFullnodeUrl(
                runtime.getSetting("SUI_NETWORK") as SuiNetwork
            ),
        });
        this.network = runtime.getSetting("SUI_NETWORK") as SuiNetwork;
        this.wallet = await parseAccount(runtime);
        return null;
    }

    async getTokenMetadata(token: string) {
        const meta = getTokenMetadata(token);
        return meta;
    }

    getAddress() {
        return this.wallet.toSuiAddress();
    }

    getAmount(amount: string | number, meta: TokenMetadata) {
        return BigInt(Number(amount) * Math.pow(10, meta.decimals));
    }

    getNetwork() {
        return this.network;
    }

    getTransactionLink(tx: string) {
        if (this.network === "mainnet") {
            return `https://suivision.xyz/txblock/${tx}`;
        } else if (this.network === "testnet") {
            return `https://testnet.suivision.xyz/txblock/${tx}`;
        } else if (this.network === "devnet") {
            return `https://devnet.suivision.xyz/txblock/${tx}`;
        } else if (this.network === "localnet") {
            return `localhost : ${tx}`;
        }
    }

    async swapToken(
        fromToken: string,
        amount: number | string,
        out_min_amount: number,
        targetToken: string
    ): Promise<SwapResult> {
        const fromMeta = getTokenMetadata(fromToken);
        const toMeta = getTokenMetadata(targetToken);
        elizaLogger.info("From token metadata:", fromMeta);
        elizaLogger.info("To token metadata:", toMeta);
        const client = new AggregatorClient(
            aggregatorURL,
            this.wallet.toSuiAddress(),
            this.suiClient,
            Env.Mainnet
        );
        // provider list : https://api-sui.cetus.zone/router_v2/status
        const routerRes = await client.findRouters({
            from: fromMeta.tokenAddress,
            target: toMeta.tokenAddress,
            amount: new BN(amount),
            byAmountIn: true, // `true` means fix input amount, `false` means fix output amount
            depth: 3, // max allow 3, means 3 hops
            providers: [
                "KRIYAV3",
                "CETUS",
                "SCALLOP",
                "KRIYA",
                "BLUEFIN",
                "DEEPBOOKV3",
                "FLOWXV3",
                "BLUEMOVE",
                "AFTERMATH",
                "FLOWX",
                "TURBOS",
                // "AFSUI",
                // "VOLO",
                // "SPRINGSUI",
                // "ALPHAFI",
                // "HAEDAL",
                // "HAEDALPMM",
            ],
        });

        if (routerRes === null) {
            elizaLogger.error(
                "No router found" +
                JSON.stringify({
                    from: fromMeta.tokenAddress,
                    target: toMeta.tokenAddress,
                    amount: amount,
                })
            );
            return {
                success: false,
                tx: "",
                message: "No router found",
            };
        }

        if (routerRes.amountOut.toNumber() < out_min_amount) {
            return {
                success: false,
                tx: "",
                message: "Out amount is less than out_min_amount",
            };
        }

        let coin: TransactionObjectArgument;
        const routerTx = new Transaction();

        if (fromToken.toUpperCase() === "SUI") {
            coin = routerTx.splitCoins(routerTx.gas, [amount]);
        } else {
            const allCoins = await this.suiClient.getCoins({
                owner: this.wallet.toSuiAddress(),
                coinType: fromMeta.tokenAddress,
                limit: 30,
            });

            if (allCoins.data.length === 0) {
                elizaLogger.error("No coins found");
                return {
                    success: false,
                    tx: "",
                    message: "No coins found",
                };
            }

            const mergeCoins = [];

            for (let i = 1; i < allCoins.data.length; i++) {
                elizaLogger.info("Coin:", allCoins.data[i]);
                mergeCoins.push(allCoins.data[i].coinObjectId);
            }
            elizaLogger.info("Merge coins:", mergeCoins);

            routerTx.mergeCoins(allCoins.data[0].coinObjectId, mergeCoins);
            coin = routerTx.splitCoins(allCoins.data[0].coinObjectId, [amount]);
        }

        const targetCoin = await client.routerSwap({
            routers: routerRes!.routes,
            byAmountIn: true,
            txb: routerTx,
            inputCoin: coin,
            slippage: 0.5,
        });

        // checking threshold

        // routerTx.moveCall({
        //     package:
        //         "0x57d4f00af225c487fd21eed6ee0d11510d04347ee209d2ab48d766e48973b1a4",
        //     module: "utils",
        //     function: "check_coin_threshold",
        //     arguments: [
        //         targetCoin,
        //         routerTx.pure(bcs.U64.serialize(out_min_amount)),
        //     ],
        //     typeArguments: [otherType],
        // });
        routerTx.transferObjects([targetCoin], this.wallet.toSuiAddress());
        routerTx.setSender(this.wallet.toSuiAddress());
        const result = await client.signAndExecuteTransaction(
            routerTx,
            this.wallet
        );

        await this.suiClient.waitForTransaction({
            digest: result.digest,
        });

        return {
            success: true,
            tx: result.digest,
            message: "Swap successful",
        };
    }

    async depositToNavi(amount: string | number): Promise<SwapResult> {
        try {
            const tx = new Transaction();
            const suiPoolConfig: PoolConfig = pool['Sui'];

            // Convert amount to MIST (1 SUI = 10^9 MIST)
            const amountInMist = Number(amount) * Math.pow(10, 9);

            // Split coins from gas
            const [suiCoin] = tx.splitCoins(tx.gas, [amountInMist]);

            // Add deposit transaction
            await depositCoin(tx, suiPoolConfig, suiCoin, amountInMist);

            // Execute transaction
            tx.setSender(this.wallet.toSuiAddress());
            const result = await this.suiClient.signAndExecuteTransaction({
                signer: this.wallet,
                transaction: tx,
            });

            await this.suiClient.waitForTransaction({
                digest: result.digest,
            });

            return {
                success: true,
                tx: result.digest,
                message: "Deposit successful",
            };
        } catch (error) {
            elizaLogger.error("Error depositing to Navi:", error);
            return {
                success: false,
                tx: "",
                message: error.message,
            };
        }
    }

    private async withRetry<T>(
        fn: () => Promise<T>,
        retries = 3,
        delay = 1000
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            elizaLogger.info(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.withRetry(fn, retries - 1, delay);
        }
    }

    async getNaviPortfolio(address: string): Promise<NaviPortfolioInfo> {
        if (!this.naviClient) {
            this.naviClient = new NAVISDKClient({
                networkType: this.network,
                numberOfAccounts: 1
            });
        }

        const account = this.naviClient.accounts[0];

        const [portfolio, poolInfo, rewards, healthFactor] = await Promise.all([
            this.withRetry(() => account.getNAVIPortfolio(address, true)),
            this.withRetry(() => this.naviClient.getPoolInfo(Sui)),
            this.withRetry(() => this.naviClient.getAddressAvailableRewards(address, 1)),
            this.withRetry(() => account.getHealthFactor(address))
        ]);

        return {
            portfolio,
            poolInfo,
            rewards,
            healthFactor
        };
    }
}
