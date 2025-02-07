import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

type NFTMapping = {
    role_id: string;
    nft_id: string;
    address: string;
    private_key: string;
    created_at: string;
};

async function getNFTMappings(): Promise<NFTMapping[]> {
    const { data, error } = await supabase
        .from('nft_mappings')
        .select('*');
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
    created_at: string;
};

async function storeUserAddress(sui_address: string) {
    try {
        const { error } = await supabase
            .from('user_addresses')
            .insert([{ sui_address }]);
        
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

export { getNFTMappings, storeNFTMapping, storeUserAddress }; 