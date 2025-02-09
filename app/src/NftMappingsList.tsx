import React, { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { type SuiObjectResponse } from '@mysten/sui/client';

export function NftMappingsList() {
    const [nftMappings, setNftMappings] = useState<{ 
        id: string; 
        role_id: string; 
        nft_id: string; 
        address: string; 
        created_at: string; 
        url?: string; 
        description?: string; 
        name?: string; 
    }[]>([]);
    
    const suiClient = useSuiClient();

    useEffect(() => {
        const fetchNftMappings = async () => {
            try {
                const response = await fetch('https://sui-colearn.vercel.app/nft-mappings');
                const data = await response.json();
                console.log('Fetched NFT mappings:', data); // 输出获取的 NFT 映射数据
                if (data.success) {
                    const mappings = data.mappings;
                    // 查询每个 NFT 的详细信息
                    const updatedMappings = await Promise.all(mappings.map(async (mapping) => {
                        console.log('Fetching details for NFT ID:', mapping.nft_id); // 输出正在获取的 NFT ID
                        const { url, description } = await getNftDetails(mapping.nft_id) || {}; // 使用 getNftDetails 函数获取 URL 和 Description
                        console.log('Fetched NFT URL:', url); // 输出获取的 NFT URL
                        console.log('Fetched NFT Description:', description); // 输出获取的 NFT Description

                        return { 
                            ...mapping, 
                            url, // 将 URL 合并到 mapping 中
                            description // 将 Description 合并到 mapping 中
                        };
                    }));
                    console.log('Updated mappings:', updatedMappings); // 输出更新后的映射
                    setNftMappings(updatedMappings);
                }
            } catch (error) {
                console.error('Error fetching NFT mappings:', error);
            }
        };

        fetchNftMappings();
    }, []);

    // 使用 SuiClient 的 getObject 函数获取 NFT 详细信息
    const getNftDetails = async (nftId: string) => {
        try {
            const response: SuiObjectResponse = await suiClient.getObject({ 
                id: nftId, 
                options: { 
                    showContent: true,
                    showDisplay: true
                } // 设置显示内容和显示元数据为 true
            });

            // 返回 URL 和 Description
            const url = response.data?.content.fields.url || null; // 如果没有 URL，返回 null
            const description = response.data?.content.fields.description || null; // 如果没有 Description，返回 null

            return { url, description }; // 返回一个对象

        } catch (error) {
            console.error('Error fetching NFT details:', error);
            return null; // 返回 null 以防止出错
        }
    };

    // 内联样式
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