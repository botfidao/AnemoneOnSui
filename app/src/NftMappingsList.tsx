import React, { useEffect, useState } from 'react';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { type SuiObjectResponse } from '@mysten/sui/client';

export function NftMappingsList() {
    const currentAccount = useCurrentAccount();
    const [nftMappings, setNftMappings] = useState<{ 
        id: string; 
        role_id: string; 
        nft_id: string; 
        address: string; 
        created_at: string; 
        url?: string; 
        description?: string; 
        name?: string; 
        owner?: string;
    }[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const suiClient = useSuiClient();

    useEffect(() => {
        const fetchNftMappings = async () => {
            if (!currentAccount) {
                setIsLoggedIn(false);
                return;
            }

            setIsLoggedIn(true);

            try {
                const response = await fetch('https://sui-colearn.vercel.app/nft-mappings');
                const data = await response.json(); // 将响应转换为 JSON 格式
                if (data.success) {
                    const updatedMappings = await Promise.all(data.mappings.map(async (mapping) => {
                        const { url, description, owner } = await getNftDetails(mapping.nft_id) || {};
                        return { ...mapping, url, description, owner };
                    }));
                    const filteredMappings = updatedMappings.filter(mapping => mapping.owner === currentAccount?.address);
                    console.log('Filtered Mappings:', filteredMappings); // 输出过滤后的映射
                    setNftMappings(filteredMappings);
                }
            } catch (error) {
                console.error('Error fetching NFT mappings:', error);
            }
        };

        fetchNftMappings();
    }, [currentAccount]);

    const getNftDetails = async (nftId: string) => {
        try {
            const response: SuiObjectResponse = await suiClient.getObject({ 
                id: nftId, 
                options: { 
                    showContent: true,
                    showOwner: true
                }
            });
            const url = response.data?.content.fields.url || null;
            const description = response.data?.content.fields.description || null;
            const owner = response.data?.owner.AddressOwner || null;
            return { url, description, owner };
        } catch (error) {
            console.error('Error fetching NFT details:', error);
            return null;
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        heading: {
            textAlign: 'center',
            color: '#333',
        },
        list: {
            listStyleType: 'none',
            padding: 0,
        },
        listItem: {
            background: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '8px',
            margin: '10px 0',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            transition: 'box-shadow 0.3s',
        },
        listItemHover: {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
        image: {
            borderRadius: '4px',
            marginRight: '15px',
            width: '100px',
            height: '100px',
        },
        paragraph: {
            margin: '5px 0',
            color: '#555',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>NFT Mappings List</h1>
            {!isLoggedIn && (
                <p style={{ color: 'red' }}>请登录您的钱包以查看 NFT 映射。</p>
            )}
            <ul style={styles.list}>
                {nftMappings.map(mapping => (
                    <li key={mapping.id} style={styles.listItem}>
                        {mapping.url && <img src={mapping.url} alt={mapping.description} style={styles.image} />}
                        <div>
                            <p style={styles.paragraph}>Role ID: {mapping.role_id}</p>
                            <p style={styles.paragraph}>NFT ID: {mapping.nft_id}</p>
                            <p style={styles.paragraph}>Address: {mapping.address}</p>
                            <p style={styles.paragraph}>Created At: {mapping.created_at}</p>
                            <p style={styles.paragraph}>Description: {mapping.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NftMappingsList;