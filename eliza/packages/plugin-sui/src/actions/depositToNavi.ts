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

// Define the payload interface for deposit
export interface DepositPayload extends Content {
    amount: string | number;
}

// Validate the deposit content
function isDepositContent(content: Content): content is DepositPayload {
    console.log("Content for deposit", content);
    return (
        typeof content.amount === "string" ||
        typeof content.amount === "number"
    );
}

// Template for extracting deposit information
const depositTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "amount": "1"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested SUI deposit:
- Amount to deposit

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "DEPOSIT_TO_NAVI",
    similes: ["DEPOSIT_SUI", "DEPOSIT"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        console.log("Validating sui deposit from user:", message.userId);
        return true;
    },
    description: "Deposit SUI tokens to Navi protocol",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting DEPOSIT_TO_NAVI handler...");

        const service = runtime.getService<SuiService>(
            ServiceType.TRANSCRIPTION
        );

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Define the schema for the expected output
        const depositSchema = z.object({
            amount: z.union([z.string(), z.number()]),
        });

        // Compose deposit context
        const depositContext = composeContext({
            state,
            template: depositTemplate,
        });

        // Generate deposit content with the schema
        const content = await generateObject({
            runtime,
            context: depositContext,
            schema: depositSchema,
            modelClass: ModelClass.SMALL,
        });

        console.log("Generated content:", content);
        const depositContent = content.object as DepositPayload;
        elizaLogger.info("Deposit content:", depositContent);

        if (service.getNetwork() == "mainnet") {
            // Validate deposit content
            if (!isDepositContent(depositContent)) {
                console.error("Invalid content for DEPOSIT_TO_NAVI action.");
                if (callback) {
                    callback({
                        text: "Unable to process deposit request. Invalid content provided.",
                        content: { error: "Invalid deposit content" },
                    });
                }
                return false;
            }

            try {
                const result = await service.depositToNavi(depositContent.amount);

                if (result.success) {
                    callback({
                        text: `Successfully deposited ${depositContent.amount} SUI to Navi, Transaction: ${service.getTransactionLink(result.tx)}`,
                        content: depositContent,
                    });
                } else {
                    callback({
                        text: `Failed to deposit: ${result.message}`,
                        content: { error: result.message },
                    });
                    return false;
                }
            } catch (error) {
                elizaLogger.error("Error depositing to Navi:", error);
                callback({
                    text: `Failed to deposit: ${error.message}`,
                    content: { error: "Failed to deposit" },
                });
                return false;
            }
        } else {
            callback({
                text: "Sorry, deposits are only available on mainnet. Parsed amount: " +
                    JSON.stringify(depositContent, null, 2),
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
                    text: "Deposit 1 SUI to Navi",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you deposit 1 SUI to Navi now...",
                    action: "DEPOSIT_TO_NAVI",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully deposited 1 SUI to Navi, Transaction: 0x39a8c432d9bdad993a33cc1faf2e9b58fb7dd940c0425f1d6db3997e4b4b05c0",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
