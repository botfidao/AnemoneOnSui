import { SkillManager } from './skillManager';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';

dotenv.config();

const keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY || "");
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const skillManager = new SkillManager(client, keypair);

// Create a new skill
// https://testnet.suivision.xyz/txblock/UwkoGHT5ThUd4wPuz595wsEv6tu7eNiMtS4Lu59aUSF
await skillManager.createSkill(
    'DexScreener Sui DEX Pairs',
    'Retrieving detailed information about DEX trading pairs on the Sui blockchain, including price, trading volume, liquidity, and other metrics.',
    `## Endpoints
[
    {
        "Name": "Get Specific Pair Information",
        "Description": "Retrieve detailed information for a specific trading pair by its address",
        "Method": "GET",
        "Parameters": [
            {
                "Name": "pairAddress",
                "Type": "string",
                "Description": "The contract address of the trading pair",
                "Location": "URL path parameter",
                "Required": "Yes"
            }
        ],
        "Response Parameters": [
            {
                "Name": "schemaVersion",
                "Type": "string",
                "Description": "API schema version"
            },
            {
                "Name": "pairs",
                "Type": "array",
                "Description": "Array of pair information",
                "Fields": [
                    {
                        "Name": "chainId",
                        "Type": "string",
                        "Description": "Blockchain identifier"
                    },
                    {
                        "Name": "dexId",
                        "Type": "string",
                        "Description": "DEX platform identifier"
                    },
                    {
                        "Name": "pairAddress",
                        "Type": "string",
                        "Description": "Contract address of the trading pair"
                    },
                    {
                        "Name": "baseToken",
                        "Type": "object",
                        "Description": "Base token information"
                    },
                    {
                        "Name": "quoteToken",
                        "Type": "object",
                        "Description": "Quote token information"
                    },
                    {
                        "Name": "priceNative",
                        "Type": "string",
                        "Description": "Price in native token"
                    },
                    {
                        "Name": "priceUsd",
                        "Type": "string",
                        "Description": "Price in USD"
                    },
                    {
                        "Name": "txns",
                        "Type": "object",
                        "Description": "Transaction statistics for different time periods"
                    },
                    {
                        "Name": "volume",
                        "Type": "object",
                        "Description": "Trading volume for different time periods"
                    },
                    {
                        "Name": "liquidity",
                        "Type": "object",
                        "Description": "Liquidity information"
                    }
                ]
            }
        ],
        "Request Example": "GET https://api.dexscreener.com/latest/dex/pairs/sui/0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab",
        "Response Example": {
    "schemaVersion": "1.0.0",
    "pairs": [{
        "chainId": "sui",
        "dexId": "cetus",
        "pairAddress": "0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab",
        "baseToken": {
            "address": "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
            "name": "USDC",
            "symbol": "USDC"
        },
        "quoteToken": {
            "address": "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            "name": "SUI Token",
            "symbol": "SUI"
        },
        "priceNative": "0.2388",
        "priceUsd": "0.9992",
        "liquidity": {
            "usd": 1182822.6,
            "base": 482327,
            "quote": 167531
        }
    }]
}
    }
]`,
    BigInt(10_000_000) // 0.01 SUI per use
);