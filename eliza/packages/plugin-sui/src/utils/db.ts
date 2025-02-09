import { createClient } from '@supabase/supabase-js';
import { fetch } from 'cross-fetch';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set in environment variables");
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
        global: { fetch },
        auth: { persistSession: false }
    }
);

type NFTMapping = {
    id?: number;
    role_id: string;
    nft_id: string;
    address: string;
    private_key: string;
    created_at: string;
};

async function getNFTMappings(): Promise<Omit<NFTMapping, 'private_key'>[]> {
    const { data, error } = await supabase
        .from('nft_mappings')
        .select('id, role_id, nft_id, address, created_at');
    
    if (error) throw error;
    return data || [];
}

async function storeNFTMapping(mapping: Omit<NFTMapping, 'created_at'>) {
    const { error } = await supabase
        .from('nft_mappings')
        .insert([{
            role_id: mapping.role_id,
            nft_id: mapping.nft_id,
            address: mapping.address,
            private_key: mapping.private_key
        }]);
    return !error;
}

// Similar type assertion for storeUserAddress
type UserAddress = {
    sui_address: string;
    secret_key: string;
    created_at: string;
};

async function storeUserAddress(sui_address: string, secret_key: string) {
    try {
        const { error } = await supabase
            .from('user_addresses')
            .insert([{ sui_address, secret_key }]);
        
        if (error) {
            console.error('Supabase error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error storing address:', error);
        return false;
    }
}

async function getSuiPrivateKey(): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('nft_mappings')
            .select('private_key')
            .eq('role_id', "0xa4e00742a13343d66dae4a0bb4592b3f0db6a293edc9673fa67109b9f5028beb")
            .single();
        
        if (error) {
            console.error('Database error when fetching private key:', error);
            return null;
        }
        
        if (!data || !data.private_key) {
            console.error('No private key found in database for the specified role_id');
            return null;
        }
        
        return data.private_key;
    } catch (error) {
        console.error('Unexpected error when accessing database:', error);
        return null;
    }
}

export { getNFTMappings, storeNFTMapping, storeUserAddress, getSuiPrivateKey }; 