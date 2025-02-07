import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { generateSuiAddress, storeNFTMappingHandler, getNFTMappingsHandler } from './controllers/addressController';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routes
app.post('/generate-address', generateSuiAddress);
app.post('/store-nft-mapping', storeNFTMappingHandler);
app.get('/nft-mappings', getNFTMappingsHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 