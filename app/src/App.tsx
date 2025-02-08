import { Theme } from "@radix-ui/themes";
import { WalletProvider, ConnectButton, useSignAndExecuteTransaction, useCurrentAccount,useSuiClient } from "@mysten/dapp-kit";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { AgentMint } from "./AgentMint";
import { Chat } from "./Chat";
import { Box, Flex, Text } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { TESTSUI_TREASURECAP_ID,TESTSUI_PACKAGE_ID, PUMPLEND_CORE_PACKAGE_ID, LENDING_STORAGE_ID, CLOCK_ID, TESTSUI_ICON_URL, TESTSUI_METADATA_ID, API_BASE_URL } from "./config";
import { useToast } from './hooks/useToast';
import { useLendingList } from "./hooks/useLendingList";

interface AddAssetEvent {
  type_name: {
    name: string;
  };
  ltv: string;
  liquidation_threshold: string;
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取借贷池列表,检查是否已存在 TESTSUI
  const { data: lendings } = useLendingList();
  const testSuiLendingExists = lendings?.some(
    lending => lending.type === `${TESTSUI_PACKAGE_ID}::testsui::TESTSUI`
  );

  return (
    <Flex justify="between" align="center" mb="6">
      <Flex gap="6" align="center">
        <Text size="5" weight="bold">PumpLend</Text>
        <Flex gap="4">
          <button 
            className={`nav-button ${location.pathname === '/createToken' ? 'active' : ''}`}
            onClick={() => navigate("/createToken")}
          >
            Create Agent
          </button>
          <button 
            className={`nav-button ${location.pathname === '/chat' ? 'active' : ''}`}
            onClick={() => navigate("/chat")}
          >
            Chat
          </button>
        </Flex>
      </Flex>
      
      <Flex gap="3" align="center">
        <ConnectButton className="wallet-button" />
      </Flex>
    </Flex>
  );
}

export default function App() {
  return (
    <Theme appearance="dark">
      <WalletProvider>
        <BrowserRouter>
          <Box p="4">
            <Navigation />
            <Routes>
              <Route path="/createToken" element={<AgentMint />} />
              <Route path="/chat/:agentId" element={<Chat />} />
              <Route path="/" element={<Navigate to="/createToken" replace />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </WalletProvider>
    </Theme>
  );
}
