import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    ServiceType,
    State,
    composeContext,
    elizaLogger,
    generateObject,
    type Action,
} from "@elizaos/core";
import { SuiService } from "../services/sui";
import { z } from "zod";

// Define the payload interface for withdraw
export interface WithdrawPayload extends Content {
    amount: string | number;
    roleId: string;
}

// Validate the withdraw content
function isWithdrawContent(content: Content): content is WithdrawPayload {
    console.log("Content for withdraw", content);
    return (
        (typeof content.amount === "string" ||
            typeof content.amount === "number") &&
        typeof content.roleId === "string"
    );
}

const withdrawTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "amount": "1",
    "roleId": "0x2dffae45e0abba83e3364b2153c8356c4bc1215bf2b53b3b38fab2b6e9ee40dd"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested SUI withdrawal:
- Amount to withdraw
- Role ID

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "WITHDRAW_FROM_NAVI",
    similes: ["WITHDRAW_SUI", "WITHDRAW"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    description: "Withdraw SUI tokens from Navi protocol",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting WITHDRAW_FROM_NAVI handler...");

        const service = runtime.getService<SuiService>(ServiceType.TRANSCRIPTION);

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const withdrawSchema = z.object({
            amount: z.union([z.string(), z.number()]),
            roleId: z.string(),
        });

        // Compose withdraw context
        const withdrawContext = composeContext({
            state,
            template: withdrawTemplate,
        });

        // Generate withdraw content with the schema
        const content = await generateObject({
            runtime,
            context: withdrawContext,
            schema: withdrawSchema,
            modelClass: ModelClass.SMALL,
        });

        const withdrawContent = content.object as WithdrawPayload;

        if (service.getNetwork() == "mainnet") {
            // Validate withdraw content
            if (!isWithdrawContent(withdrawContent)) {
                console.error("Invalid content for WITHDRAW_FROM_NAVI action.");
                if (callback) {
                    callback({
                        text: "Unable to process withdraw request. Invalid content provided.",
                        content: { error: "Invalid withdraw content" },
                    });
                }
                return false;
            }

            try {
                const result = await service.withdrawSuiFromNaviAndDepositToRole(
                    withdrawContent.amount,
                    withdrawContent.roleId
                );

                if (result.success) {
                    callback({
                        text: `Successfully withdrew ${withdrawContent.amount} SUI from Navi, Transaction: ${service.getTransactionLink(result.tx)}`,
                        content: withdrawContent,
                    });
                } else {
                    callback({
                        text: `Failed to withdraw: ${result.message}`,
                        content: { error: result.message },
                    });
                    return false;
                }
            } catch (error) {
                elizaLogger.error("Error withdrawing from Navi:", error);
                callback({
                    text: `Failed to withdraw: ${error.message}`,
                    content: { error: "Failed to withdraw" },
                });
                return false;
            }
        } else {
            callback({
                text: "Sorry, withdrawals are only available on mainnet. Parsed amount: " +
                    JSON.stringify(withdrawContent, null, 2),
                content: { error: "Unsupported network" },
            });
            return false;
        }

        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Withdraw 1 SUI from Navi\nroleId=0x2dffae45e0abba83e3364b2153c8356c4bc1215bf2b53b3b38fab2b6e9ee40dd",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you withdraw 1 SUI from Navi now...",
                    action: "WITHDRAW_FROM_NAVI",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully withdrew 1 SUI from Navi, Transaction: 0x39a8c432d9bdad993a33cc1faf2e9b58fb7dd940c0425f1d6db3997e4b4b05c0",
                },
            },
        ],
    ] as ActionExample[][],
} as Action; 