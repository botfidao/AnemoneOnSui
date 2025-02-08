import { RoleManager } from './roleManager';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';

dotenv.config();

const keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY || "");
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const roleManager = new RoleManager();

// Create new role
// https://testnet.suivision.xyz/txblock/547b8uPjF2m4Z3udUQtLhDzghpjrrjjGB4EHCZucTBKE
const tx1 = await roleManager.createRole(
    '0x8b61df0302677d4dd003f2168ba8277009d5a6a07cbeaf4ad1649c26c748143e',
    'REX',
    'Description',
    'https://avatars.githubusercontent.com/u/76983474',
    BigInt(1_000_000_000) // 1 SUI
);

await client.signAndExecuteTransaction({
    transaction: tx1,
    signer: keypair,
    options: {
        showEffects: true,
    },
})

// Deposit SUI to role
// https://testnet.suivision.xyz/txblock/ESXocaF1ftZDiczeahM2s7hns4w6opPzH4JvSkT7dxjN
const tx2 = await roleManager.depositSui(
    '0x5c6db85f0734465d24c24dacf12333977e29b05ce902d8d60dd73e711f71e4b0',
    BigInt(500_000_000) // 0.5 SUI
);

await client.signAndExecuteTransaction({
    transaction: tx2,
    signer: keypair,
    options: {
        showEffects: true,
    },
})
// Add skill to role
// https://testnet.suivision.xyz/txblock/4pYu6qg7mmLpCfD4yCjs7hnYJBEL42uLx6LirfH8YuqA
const tx3 = await roleManager.addSkill(
    '0x5c6db85f0734465d24c24dacf12333977e29b05ce902d8d60dd73e711f71e4b0', // roleId
    '0xc5bee9e1a2a367965f8c9c395e4159df2fc10a606bc64135b183dd1f1f4f985e', // botNftId 
    '0xdbd080c9e6af49d52bd097987226eca9bee765829e07844e3d4d183f62cd405f' // skillId
);

await client.signAndExecuteTransaction({
    transaction: tx3,
    signer: keypair,
    options: {
        showEffects: true,
    },
})