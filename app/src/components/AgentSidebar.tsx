import { Box, Flex, Text, Avatar, Button, TextField } from "@radix-ui/themes";
import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RoleManager } from '../../../sdk/roleManager';

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
  const roleManager = new RoleManager();
  
  const roleId = "0x2dffae45e0abba83e3364b2153c8356c4bc1215bf2b53b3b38fab2b6e9ee40dd";
  const nftId = "0x044d9784dd5f1432cc976306580c088ed3641cfbffddfeaeb00439f9e292b9d9";

  const { data: agentInfo, refetch } = useQuery<AgentInfo>({
    queryKey: ['agentInfo', roleId, nftId],
    queryFn: async () => {
      const [roleData, nftData] = await Promise.all([
        suiClient.getObject({
          id: roleId,
          options: { showContent: true }
        }),
        suiClient.getObject({
          id: nftId,
          options: { showContent: true }
        })
      ]);

      const balance = (roleData.data?.content as any)?.fields?.balance || "0";
      const nftFields = (nftData.data?.content as any)?.fields;
      
      return {
        name: nftFields?.name || "Unknown",
        description: nftFields?.description || "No description",
        url: nftFields?.url || "https://placeholder.com/avatar.png",
        balance: (Number(balance) / 1e9).toFixed(2)
      };
    }
  });

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

  const handleDeposit = async () => {
    try {
      if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
        return;
      }

      setIsDepositing(true);
      
      // 转换为 MIST (1 SUI = 1e9 MIST)
      const amountInMist = BigInt(Math.floor(Number(depositAmount) * 1e9));
      
      const tx = await roleManager.depositSui(
        roleId,
        amountInMist
      );

      await signAndExecute({
        transaction: tx,
      });

      await refetch();
      setShowDepositInput(false);
      setDepositAmount("1");
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
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
          <Text className="text-lg font-bold mb-2">{agentInfo?.name}</Text>
          <Text className="text-gray-400 text-sm" style={{ lineHeight: "1.5" }}>
            {agentInfo?.description}
          </Text>
        </Box>

        <Flex direction="column" gap="2">
          <Text className="text-gray-400 text-sm">Balance</Text>
          <Text className="text-xl font-medium">{agentInfo?.balance} SUI</Text>
          
          {showDepositInput ? (
            <Flex direction="column" gap="2">
              <div className="deposit-input-container">
                <input
                  type="text"
                  placeholder="输入 SUI 数量"
                  value={depositAmount}
                  onChange={(e) => handleDepositAmountChange(e.target.value)}
                  className="deposit-input p-2 border border-gray-600 rounded" // 使用 Tailwind CSS 样式
                />
              </div>
              <div className="deposit-actions flex gap-2">
                <Button 
                  className="deposit-button w-full"
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount || Number(depositAmount) <= 0}
                >
                  {isDepositing ? 'Depositing...' : 'Confirm'}
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
      </Flex>
    </Box>
  );
}
