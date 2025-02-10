import React, { useEffect, useState } from 'react';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { type SuiObjectResponse } from '@mysten/sui/client';
import { List, Card, Typography, Image, Alert, Tooltip, message, Skeleton } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './styles.css'
import { useNavigate } from 'react-router-dom';

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
    const [loading, setLoading] = useState(true);
    
    const suiClient = useSuiClient();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNftMappings = async () => {
            if (!currentAccount) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }

            setIsLoggedIn(true);
            setLoading(true);

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
            } finally {
                setLoading(false);
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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                message.success('复制成功！');
            })
            .catch(() => {
                message.error('复制失败，请重试。');
            });
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <Typography.Title 
              level={2} 
              style={{ color: "white" }} 
              className="text-center font-bold text-2xl mb-8 "
            >
              Agent Hub
            </Typography.Title>
    
            {!isLoggedIn && (
              <Alert
                message="Operation Prompt"
                description="Please connect your wallet to view Agents"
                type="warning"
                showIcon
                className="mb-8 bg-gray-800 border-gray-700 text-gray-300"
              />
            )}
    
            {loading ? (
              <Skeleton 
                active 
                paragraph={{ rows: 4, width: '100%' }}
                title={{ width: '80%' }}
                className="bg-gray-700"
              />
            ) : (
              <List
                grid={{ 
                  gutter: 24,
                  xs: 1,
                  sm: 1,
                  md: 2,
                  lg: 2,
                  xl: 3,
                  xxl: 3
                }}
                dataSource={nftMappings}
                renderItem={(mapping) => (
                  <List.Item>
                    <Card
                      className="hover:bg-gray-800 transition-all duration-300 rounded-xl shadow-lg border-gray-700 cursor-pointer"
                      bodyStyle={{ padding: 0 }}
                      onClick={() => navigate(`/chat/${mapping.role_id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {mapping.url && (
                            <Image
                              width={120}
                              height={120}
                              src={mapping.url}
                              alt={mapping.description}
                              className="rounded-lg object-cover border-2 border-gray-600"
                              fallback="https://via.placeholder.com/120?text=NFT+Image"
                            />
                          )}
    
                        <div className="flex-1 space-y-3">
                          <div className="group flex items-center gap-2">
                            <Tooltip title="Copy">
                              <Typography.Text
                                strong
                                className="block text-gray-100 hover:text-blue-400 cursor-pointer truncate"
                                onClick={() => handleCopy(mapping.role_id)}
                                style={{ maxWidth: '150px' }}
                              >
                                Role ID: {mapping.role_id}
                                <CopyOutlined className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Typography.Text>
                            </Tooltip>
                          </div>
    
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {[
                                { label: 'NFT ID', value: mapping.nft_id },
                                { label: 'Address', value: mapping.address },
                                { label: 'CreateAt', value: mapping.created_at }
                              ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center">
                                  <span className="text-gray-400">{item.label}:</span>
                                  <Tooltip title={item.value}>
                                    <Typography.Text
                                      className="text-gray-300 truncate ml-2 cursor-pointer hover:text-blue-400"
                                      onClick={() => handleCopy(item.value)}
                                      style={{ maxWidth: '150px' }}
                                    >
                                      {item.value}
                                    </Typography.Text>
                                  </Tooltip>
                                </div>
                              ))}
    
                              {mapping.description && (
                                <div className="col-span-full pt-2 border-t border-gray-700">
                                  <Typography.Text className="text-gray-400 italic">
                                    "{mapping.description}"
                                  </Typography.Text>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>
      );
    }

export default NftMappingsList;