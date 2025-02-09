import type { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const suiEnvSchema = z.object({
    SUI_PRIVATE_KEY: z.string().min(1, "Sui private key is required"),
    SUI_NETWORK: z.enum(["mainnet", "testnet"]),
    SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
    SUPABASE_KEY: z.string().min(1, "Supabase key is required"),
});

export type SuiConfig = z.infer<typeof suiEnvSchema>;

export async function validateSuiConfig(
    runtime: IAgentRuntime
): Promise<SuiConfig> {
    try {
        const config = {
            SUI_PRIVATE_KEY:
                runtime.getSetting("SUI_PRIVATE_KEY") ||
                process.env.SUI_PRIVATE_KEY,
            SUI_NETWORK:
                runtime.getSetting("SUI_NETWORK") || process.env.SUI_NETWORK,
            SUPABASE_URL:
                runtime.getSetting("SUPABASE_URL") || process.env.SUPABASE_URL,
            SUPABASE_KEY:
                runtime.getSetting("SUPABASE_KEY") || process.env.SUPABASE_KEY,
        };

        return suiEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Sui configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
