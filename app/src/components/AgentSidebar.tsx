import { Box, Flex, Text, Avatar, Button, TextField } from "@radix-ui/themes";
import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RoleManager } from '../../../sdk/roleManager';
import { useParams } from 'react-router-dom';
import React from 'react';
import { notification } from 'antd';
import 'antd';

interface AgentInfo {
  name: string;
  description: string;
  url: string;
  balance: string;
}

export function AgentSidebar() {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1");
  const [showDepositInput, setShowDepositInput] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const roleManager = new RoleManager();
  const { roleId } = useParams();
  
  // 获取 nftId 的查询
  const { data: nftData } = useQuery({
    queryKey: ['nftId', roleId],
    queryFn: async () => {
      if (!roleId) return null;
      const response = await fetch(`https://sui-colearn.vercel.app/nft-mapping/nft-id/${roleId}`);
      const data = await response.json();
      return data.success ? data.nft_id : null;
    },
    enabled: !!roleId
  });

  // Agent 信息查询
  const { data: agentInfo, refetch } = useQuery<AgentInfo | null>({
    queryKey: ['agentInfo', roleId, nftData],
    queryFn: async () => {
      if (!roleId || !nftData) return null;

      const [roleData, nftObjData] = await Promise.all([
        suiClient.getObject({
          id: roleId,
          options: { showContent: true }
        }),
        suiClient.getObject({
          id: nftData,
          options: { showContent: true }
        })
      ]);

      const balance = (roleData.data?.content as any)?.fields?.balance || "0";
      const nftFields = (nftObjData.data?.content as any)?.fields;
      
      return {
        name: nftFields?.name || "Unknown",
        description: nftFields?.description || "No description",
        url: nftFields?.url || "https://placeholder.com/avatar.png",
        balance: (Number(balance) / 1e9).toFixed(2)
      };
    },
    enabled: !!roleId && !!nftData
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 重新获取 agentInfo 的逻辑
      refetch(); // 假设您有一个 refetch 函数来重新获取 agentInfo
    }, 2000); // 每 5000 毫秒（5 秒）刷新一次

    return () => clearInterval(interval); // 清理定时器
  }, []); // 空依赖数组，确保只在组件挂载时设置定时器

  const handleDepositAmountChange = (value: string) => {
    // 只允许数字和小数点
    const filtered = value.replace(/[^\d.]/g, '');
    // 确保只有一个小数点
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    // 限制小数位数为9位
    if (parts[1] && parts[1].length > 9) {
      return;
    }
    setDepositAmount(filtered);
  };

  const openNotification = (message: string, type: 'success' | 'error') => {
    notification[type]({
      message: type === 'success' ? 'success' : 'fail',
      description: message,
      placement: 'topRight',
      duration: 3,
    });
  };

  const handleDeposit = async () => {
    try {
      if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0 || !roleId) {
        return;
      }

      setIsDepositing(true);
      
      const amountInMist = BigInt(Math.floor(Number(depositAmount) * 1e9));
      
      const tx = await roleManager.depositSui(
        roleId,
        amountInMist
      );

      await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            openNotification("Deposit successful!", "success");
            await suiClient.waitForTransaction({
              digest: result.digest,
            });
            setIsDepositing(false);
          },
          onError: (error) => {
            console.error('Deposit failed:', error);
            openNotification("Deposit failed: " + error.message, "error");
            setIsDepositing(false);
          },
        }
      );

      await refetch();
      setDepositAmount("1");
    } catch (error) {
      console.error('Deposit failed:', error);
      openNotification("Deposit failed: " + error.message, "error");
      setIsDepositing(false);
    }
  };

  const handleWithdrawAmountChange = (value: string) => {
    // 只允许数字和小数点
    const filtered = value.replace(/[^\d.]/g, '');
    // 确保只有一个小数点
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    // 限制小数位数为9位
    if (parts[1] && parts[1].length > 9) {
      return;
    }
    setWithdrawAmount(filtered);
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0 || !roleId || !nftData) {
        return;
      }

      setIsDepositing(true);
      
      const amountInMist = BigInt(Math.floor(Number(withdrawAmount) * 1e9));
      
      const tx = await roleManager.withdrawSuiWithNft(
        roleId,
        nftData,
        amountInMist
      );

      await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            openNotification("Withdraw successful!", "success");
            await suiClient.waitForTransaction({
              digest: result.digest,
            });
            setIsDepositing(false);
          },
          onError: (error) => {
            console.error('Withdraw failed:', error);
            openNotification("Withdraw failed: " + error.message, "error");
            setIsDepositing(false);
          },
        }
      );

      await refetch();
      setWithdrawAmount("1");
    } catch (error) {
      console.error('Withdraw failed:', error);
      openNotification("Withdraw failed: " + error.message, "error");
      setIsDepositing(false);
    }
  };

  return (
    <Box className="bg-gray-800 border-r border-gray-600 w-72 h-full p-4"> {/* 使用 Tailwind CSS 样式 */}
      <Flex direction="column" gap="4">
        <Avatar
          size={64} // 使用 Ant Design 的 Avatar 组件
          src={agentInfo?.url}
          shape="circle"
          alt="Agent Avatar"
        />
        
        <Box>
          <Box>
            <Text className="text-lg font-bold mb-2">{agentInfo?.name}</Text>
          </Box>
          <Box>
            <Text className="text-gray-400 text-sm mb-2" style={{ lineHeight: "1.5" }}>
              {agentInfo?.description}
            </Text>
          </Box>
        </Box>

        <Flex direction="column" gap="2">
          <Text className="text-gray-400 text-sm">Balance</Text>
          <Text className="text-xl font-medium">{agentInfo?.balance} SUI</Text>

          {/* 存款输入框和按钮 */}
          <Flex direction="column" gap="2">
            {showDepositInput ? (
              <Flex direction="column" gap="2">
                <div className="deposit-input-container">
                  <input
                    type="text"
                    placeholder="输入 SUI 数量"
                    value={depositAmount}
                    onChange={(e) => handleDepositAmountChange(e.target.value)}
                    className="deposit-input p-2 border border-gray-600 rounded"
                  />
                </div>
                <div className="deposit-actions flex gap-2">
                  <Button 
                    className="deposit-button w-full"
                    onClick={handleDeposit}
                    disabled={isDepositing || !depositAmount || Number(depositAmount) <= 0}
                  >
                    {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
                  </Button>
                  <Button 
                    className="deposit-button secondary w-full"
                    onClick={() => {
                      setShowDepositInput(false);
                      setDepositAmount("1");
                    }}
                    disabled={isDepositing}
                  >
                    Cancel
                  </Button>
                </div>
              </Flex>
            ) : (
              <Button 
                className="deposit-button w-full"
                onClick={() => setShowDepositInput(true)}
              >
                Deposit SUI
              </Button>
            )}
          </Flex>

          {/* 取款输入框和按钮 */}
          <Flex direction="column" gap="2">
            {showWithdrawInput ? (
              <Flex direction="column" gap="2">
                <div className="withdraw-input-container">
                  <input
                    type="text"
                    placeholder="输入取款金额"
                    value={withdrawAmount}
                    onChange={(e) => handleWithdrawAmountChange(e.target.value)}
                    className="withdraw-input p-2 border border-gray-600 rounded"
                  />
                </div>
                <div className="withdraw-actions flex gap-2">
                  <Button 
                    className="deposit-button w-full"
                    onClick={handleWithdraw}
                    disabled={isDepositing || !withdrawAmount || Number(withdrawAmount) <= 0}
                  >
                    {isDepositing ? 'Withdrawing...' : 'Confirm Withdraw'}
                  </Button>
                  <Button 
                    className="deposit-button secondary w-full"
                    onClick={() => {
                      setShowWithdrawInput(false);
                      setWithdrawAmount("1");
                    }}
                    disabled={isDepositing}
                  >
                    Cancel
                  </Button>
                </div>
              </Flex>
            ) : (
              <Button 
                className="deposit-button w-full"
                onClick={() => setShowWithdrawInput(true)}
              >
                Withdraw SUI
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
