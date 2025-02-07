import { Request, Response } from 'express';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { getNFTMappings, storeNFTMapping, storeUserAddress } from '../db/database';

export const generateSuiAddress = async (req: Request, res: Response) => {
    try {
        const keypair = new Ed25519Keypair();
        const address = keypair.getPublicKey().toSuiAddress();
        
        const success = await storeUserAddress(address);
        if (!success) {
            console.error('Failed to store address in database');
            return res.status(500).json({ error: 'Error storing address' });
        }
        
        res.json({
            success: true,
            address: address
        });
    } catch (error) {
        console.error('Error in generateSuiAddress:', error);
        res.status(500).json({ error: 'Error generating address' });
    }
};

export const storeNFTMappingHandler = async (req: Request, res: Response) => {
    try {
        const { role_id, nft_id, address, private_key } = req.body;

        if (!role_id || !nft_id || !address || !private_key) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const success = await storeNFTMapping({
            role_id,
            nft_id,
            address,
            private_key
        });

        if (!success) {
            return res.status(500).json({ error: 'Error storing NFT mapping' });
        }
        
        res.json({
            success: true,
            message: 'NFT mapping stored successfully'
        });
    } catch (error) {
        console.error('Error storing NFT mapping:', error);
        res.status(500).json({ error: 'Error storing NFT mapping' });
    }
};

export const getNFTMappingsHandler = async (req: Request, res: Response) => {
    try {
        const mappings = await getNFTMappings();
        res.json({
            success: true,
            mappings
        });
    } catch (error) {
        console.error('Error fetching NFT mappings:', error);
        res.status(500).json({ error: 'Error fetching NFT mappings' });
    }
}; 