import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    ServiceType,
    State,
    type Action,
} from "@elizaos/core";
import { SuiService } from "../services/sui";

// Add helper function for formatting numbers
function formatTokenAmount(amount: number, decimals: number = 9): string {
    return (amount / Math.pow(10, decimals)).toFixed(4);
}

// Add reward type mapping
const REWARD_TOKEN_MAP: { [key: string]: string } = {
    '0': 'vSui',
    '0extra': 'NAVX',
    // 可以轻松添加更多奖励类型
    // 'someKey': 'TOKEN_NAME',
};

export default {
    name: "GET_NAVI_PORTFOLIO",
    similes: ["CHECK_NAVI", "NAVI_STATUS", "NAVI_PORTFOLIO"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    description: "Get Navi protocol portfolio information",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        const service = runtime.getService<SuiService>(ServiceType.TRANSCRIPTION);
        const address = service.getAddress();

        try {
            const naviInfo = await service.getNaviPortfolio(address);

            // Format portfolio information
            let portfolioText = "📊 Navi Portfolio Summary\n\n";

            // Add supply and borrow positions with decimal formatting
            portfolioText += "💰 Positions:\n";
            naviInfo.portfolio.forEach((value, token) => {
                if (value.supplyBalance > 0 || value.borrowBalance > 0) {
                    portfolioText += `${token}:\n`;
                    if (value.supplyBalance > 0) {
                        portfolioText += `  Supply: ${formatTokenAmount(value.supplyBalance)}\n`;
                    }
                    if (value.borrowBalance > 0) {
                        portfolioText += `  Borrow: ${formatTokenAmount(value.borrowBalance)}\n`;
                    }
                }
            });

            // Add pool information
            portfolioText += "\n📈 SUI Pool Stats:\n";
            portfolioText += `Supply APR: ${naviInfo.poolInfo.base_supply_rate}%\n`;
            portfolioText += `Borrow APR: ${naviInfo.poolInfo.base_borrow_rate}%\n`;
            portfolioText += `Token Price: $${naviInfo.poolInfo.tokenPrice}\n`;
            portfolioText += `Max LTV: ${(Number(naviInfo.poolInfo.max_ltv) * 100).toFixed(0)}%\n`;

            // Add health factor
            portfolioText += `\n💪 Health Factor: ${naviInfo.healthFactor.toFixed(2)}\n`;

            // Add rewards
            if (Object.keys(naviInfo.rewards).length > 0) {
                portfolioText += "\n🎁 Available Rewards:\n";
                Object.entries(naviInfo.rewards).forEach(([key, reward]) => {
                    const tokenType = REWARD_TOKEN_MAP[key] || 'Unknown';
                    portfolioText += `${reward.available} ${tokenType}\n`;
                });
            }

            callback({
                text: portfolioText,
                content: naviInfo
            });

            return true;
        } catch (error) {
            callback({
                text: `Error fetching Navi portfolio: ${error.message}`,
                content: { error: error.message }
            });
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show Navi portfolio",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Here's your Navi portfolio information...",
                    action: "GET_NAVI_PORTFOLIO",
                },
            },
        ],
    ] as ActionExample[][],
} as Action; 