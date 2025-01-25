import { AnemoneSDK } from './sdk';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';
import { type SuiObjectChange } from '@mysten/sui/client';

dotenv.config();

const keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY || "");
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const sdk = new AnemoneSDK(client, keypair);

async function getCreatedObjects(digest: string) {
    const txDetails = await client.getTransactionBlock({
        digest,
        options: {
            showEffects: true,
            showEvents: true,
            showInput: true,
            showObjectChanges: true,
        },
    });

    return txDetails.objectChanges?.filter(
        (change): change is SuiObjectChange & { type: "created" } => 
            change.type === "created"
    ) || [];
}

async function main() {
    // Create a new skill
    console.log('Creating skill...');
    const createSkillTx = await sdk.skillManager.createSkill(
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
    
    await client.waitForTransaction({
        digest: createSkillTx.digest,
    });
    
    const skillObjects = await getCreatedObjects(createSkillTx.digest);
    const skillId = skillObjects[0]?.objectId;
    console.log('Created skill with ID:', skillId);

    // Create a new role
    console.log('\nCreating role...');
    const createRoleTx = await sdk.roleManager.createRole(
        '0x8b61df0302677d4dd003f2168ba8277009d5a6a07cbeaf4ad1649c26c748143e', // bot address
        'REX',
        'Description',
        'https://avatars.githubusercontent.com/u/76983474',
        BigInt(1_000_000_000) // 1 SUI
    );

    await client.waitForTransaction({
        digest: createRoleTx.digest,
    });

    const roleObjects = await getCreatedObjects(createRoleTx.digest);
    // 根据类型筛选Role和BotNFT对象
    const roleId = roleObjects.find(obj => 
        obj.objectType.includes('::role_manager::Role'))?.objectId;
    const botNftId = roleObjects.find(obj => 
        obj.objectType.includes('::bot_nft::BotNFT'))?.objectId;
    
    console.log('Created role with ID:', roleId);
    console.log('Created bot NFT with ID:', botNftId);

    if (!skillId || !roleId || !botNftId) {
        throw new Error('Failed to get created object IDs');
    }

    // Add skill to role
    console.log('\nAdding skill to role...');
    const addSkillTx = await sdk.roleManager.addSkill(
        roleId,
        botNftId,
        skillId
    );

    await client.waitForTransaction({
        digest: addSkillTx.digest,
    });

    const txDetails = await client.getTransactionBlock({
        digest: addSkillTx.digest,
        options: {
            showEffects: true,
            showEvents: true,
            showInput: true,
            showObjectChanges: true,
        },
    });

    console.log('\nTransaction details:');
    console.log('Status:', txDetails.effects?.status.status);
    console.log('Events:', txDetails.events);
    console.log('Object changes:', txDetails.objectChanges);
}

main().catch(console.error); 