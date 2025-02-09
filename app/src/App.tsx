import { Theme } from "@radix-ui/themes";
import { WalletProvider, ConnectButton, useSignAndExecuteTransaction, useCurrentAccount,useSuiClient } from "@mysten/dapp-kit";
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { AgentMint } from "./AgentMint";
import { Chat } from "./Chat";
import { Box, Flex, Text } from "@radix-ui/themes";
import  NftMappingsList  from "./NftMappingsList";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Flex justify="between" align="center" mb="6">
      <Flex gap="6" align="center">
        <Text size="5" weight="bold">PumpLend</Text>
        <Flex gap="4">
        <button 
            className={`nav-button ${location.pathname === '/nftMappings' ? 'active' : ''}`}
            onClick={() => navigate("/")}
          >
            NFT Mappings
          </button>
          <button 
            className={`nav-button ${location.pathname === '/createAgent' ? 'active' : ''}`}
            onClick={() => navigate("/createAgent")}
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
