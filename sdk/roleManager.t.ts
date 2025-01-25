import { RoleManager } from './roleManager';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';

dotenv.config();

const keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY || "");
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const roleManager = new RoleManager(client, keypair);

// Create new role
await roleManager.createRole(
    '0x8b61df0302677d4dd003f2168ba8277009d5a6a07cbeaf4ad1649c26c748143e',
    'REX',
    'Description',
    'https://avatars.githubusercontent.com/u/76983474',
    BigInt(1_000_000_000) // 1 SUI
);