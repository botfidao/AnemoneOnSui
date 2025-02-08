import { AnemoneSDK} from '../../sdk'
import { type SuiObjectChange } from '@mysten/sui/client';
import { Box, Button, Container, Flex, Text } from "@radix-ui/themes";
import * as Form from "@radix-ui/react-form";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { PUMPLEND_CORE_PACKAGE_ID, API_BASE_URL } from "./config";
import { Toast } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { data } from 'react-router-dom';

export function AgentMint() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [agentName, setAgentName] = useState("");
  const [agentLogo, setAgentLogo] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, showToast, hideToast } = useToast();
  const sdk = new AnemoneSDK();
 
  async function getCreatedObjects(digest: string) {
    const txDetails = await suiClient.getTransactionBlock({
        digest,
        options: {
            showEffects: true,
            showEvents: true,
            showInput: true,
            showObjectChanges: true,
        },
    });

    return txDetails.objectChanges?.filter(
        (change): change is SuiObjectChange & { type: "created" } => 
            change.type === "created"
    ) || [];
}

  const handleTradingBotClick = async () => {
    let address: string | undefined;
    try {
        if (!currentAccount) {
            showToast("Please connect your wallet", "error");
            return;
        }
        
        setIsLoading(true);
        showToast("Generating address...", "info");

        const response = await fetch("https://sui-colearn.vercel.app/generate-address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to generate address");
        }

        const data = await response.json();
        address = data.address;
        console.log("Generated Address:", address);
        showToast("Address generated successfully", "info");
    } catch (error) {
        if (error instanceof Error) {
            showToast(error.message, "error");
        } else {
            showToast("Failed to generate address", "error");
        }
        setIsLoading(false);
        return;
    }

    console.log('\nCreating role...');
    if (!address) {
        showToast("Address is not defined", "error");
        return;
    }

    const tx = await sdk.roleManager.createRole(
        address,
        agentName,
        agentDescription,
        agentLogo,
        BigInt(100_000_000) // 0.1 SUI
    );

    signAndExecute(
        {
            transaction: tx,
        },
        {
            onSuccess: async (result) => {
                showToast("Creating role...", "info");
                await suiClient.waitForTransaction({
                    digest: result.digest,
                });

                const roleObjects = await getCreatedObjects(result.digest);
                // Filter Role and BotNFT objects
                const roleId = roleObjects.find(obj => 
                    obj.objectType.includes('::role_manager::Role'))?.objectId;
                const botNftId = roleObjects.find(obj => 
                    obj.objectType.includes('::bot_nft::BotNFT'))?.objectId;
                
                console.log('Created role with ID:', roleId);
                console.log('Created bot NFT with ID:', botNftId);

                // Store NFT mapping
                const mappingResponse = await fetch("https://sui-colearn.vercel.app/store-nft-mapping", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        address: address,
                        nft_id: botNftId,
                        role_id: roleId,
                    }),
                });

                if (!mappingResponse.ok) {
                    throw new Error("Failed to store NFT mapping");
                }

                console.log("NFT mapping stored successfully");
                showToast("Agent created successfully!", "success");
                setIsLoading(false);
            },
            onError: (error) => {
                showToast(error.message || "Failed to create agent", "error");
                setIsLoading(false);
            },
        }
    );

  };

  // 添加新的辅助函数
  const getButtonText = () => {
    if (!currentAccount) {
      return "Connect Wallet";
    }
    return isLoading ? <ClipLoader size={20} color="white" /> : "Create Agent";
  };

  // 修改按钮禁用状态的判断函数
  const isButtonDisabled = () => {
    const trimmedName = agentName.trim();
    const trimmedLogo = agentLogo.trim();
    const trimmedDescription = agentDescription.trim();

    // 检查所有字段是否都已填写
    const allFieldsFilled =
      trimmedName && trimmedLogo && trimmedDescription;

    if (!currentAccount) {
      // 如果未连接钱包，只有在所有字段都填写后才可点击
      return !allFieldsFilled;
    }
    return isLoading || !allFieldsFilled;
  };

  // 添加按钮点击处理函数
  const handleButtonClick = () => {
    if (!currentAccount) {
      // 如果未连接钱包，触发钱包连接
      document.querySelector<HTMLButtonElement>(".wallet-button")?.click();
      return;
    }
    handleTradingBotClick();
  };

  return (
    <Container size="1" mt="6">
      <Flex direction="column" gap="6">
        <Box>
          <Text size="5" weight="bold" align="center">
            Create Agent
          </Text>
        </Box>

        <Form.Root
          onSubmit={(e) => {
            e.preventDefault();
            handleButtonClick();
          }}
        >
          <Flex direction="column" gap="4">
            <Form.Field name="agentName">
              <Form.Control asChild>
                <input
                  className="text-field"
                  placeholder="Agent Name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  onBlur={(e) => setAgentName(e.target.value.trim())}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field name="agentLogo">
              <Form.Control asChild>
                <input
                  className="text-field"
                  placeholder="Agent Logo URL"
                  value={agentLogo}
                  onChange={(e) => setAgentLogo(e.target.value)}
                  onBlur={(e) => setAgentLogo(e.target.value.trim())}
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="agentDescription">
              <Form.Control asChild>
                <input
                  className="text-field"
                  placeholder="Agent Description"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  onBlur={(e) => setAgentDescription(e.target.value.trim())}
                />
              </Form.Control>
            </Form.Field>

            <Button
              size="3"
              className="swap-button"
              type="submit"
              disabled={isButtonDisabled()}
            >
              {getButtonText()}
            </Button>
          </Flex>
        </Form.Root>

        {/* 渲染 Toasts */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
            txHash={toast.txHash}
            tokenUrl={toast.tokenUrl}
            duration={toast.type === "success" ? 6000 : 3000}
          />
        ))}
      </Flex>
    </Container>
  );
}
