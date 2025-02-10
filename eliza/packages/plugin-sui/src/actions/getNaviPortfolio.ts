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
import { z } from "zod";
import { composeContext, generateObject } from "@elizaos/core";

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

// Template for extracting portfolio information
const portfolioTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "roleId": "0x2dffae45e0abba83e3364b2153c8356c4bc1215bf2b53b3b38fab2b6e9ee40dd"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the Navi portfolio request:
- Role ID

Respond with a JSON markdown block containing only the extracted values.`;

// Define the payload interface
export interface PortfolioPayload extends Content {
    roleId: string;
}

// Validate the portfolio content
function isPortfolioContent(content: Content): content is PortfolioPayload {
    return typeof content.roleId === "string";
}

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

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const portfolioSchema = z.object({
            roleId: z.string(),
        });

        // Compose portfolio context
        const portfolioContext = composeContext({
            state,
            template: portfolioTemplate,
        });

        // Generate portfolio content with the schema
        const content = await generateObject({
            runtime,
            context: portfolioContext,
            schema: portfolioSchema,
            modelClass: ModelClass.SMALL,
        });

        const portfolioContent = content.object as PortfolioPayload;

        try {
            const naviInfo = await service.getNaviPortfolio(portfolioContent.roleId);

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
            portfolioText += "\n💪 Health Factor: ";
            portfolioText += naviInfo.healthFactor > 100000 ? "∞" : naviInfo.healthFactor.toFixed(2);
            portfolioText += "\n";

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
                    text: "Show Navi portfolio\nroleId=0x2dffae45e0abba83e3364b2153c8356c4bc1215bf2b53b3b38fab2b6e9ee40dd",
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