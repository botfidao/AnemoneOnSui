import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID } from "./config";

export class SkillManager {
    private client: SuiClient;
    private signer: Parameters<SuiClient['signAndExecuteTransaction']>[0]['signer'];

    constructor(
        client: SuiClient,
        signer: Parameters<SuiClient['signAndExecuteTransaction']>[0]['signer']
    ) {
        this.client = client;
        this.signer = signer;
    }

    /**
     * Create a new Skill
     * @param name - Skill name
     * @param description - Skill description
     * @param doc - Skill documentation
     * @param fee - Skill usage fee (in MIST)
     */
    async createSkill(
        name: string,
        description: string,
        doc: string,
        fee: bigint
    ) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::skill_manager::create_skill`,
            arguments: [
                tx.pure.string(name),
                tx.pure.string(description),
                tx.pure.string(doc),
                tx.pure.u64(fee)
            ],
        });

        return await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer: this.signer,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
    }

    /**
     * Update an existing Skill
     * @param skillId - The Skill object ID
     * @param name - New skill name
     * @param description - New skill description
     * @param doc - New skill documentation
     * @param fee - New skill usage fee (in MIST)
     */
    async updateSkill(
        skillId: string,
        name: string,
        description: string,
        doc: string,
        fee: bigint
    ) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::skill_manager::update_skill`,
            arguments: [
                tx.object(skillId),
                tx.pure.string(name),
                tx.pure.string(description),
                tx.pure.string(doc),
                tx.pure.u64(fee)
            ],
        });

        return await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer: this.signer,
            options: {
                showEffects: true,
            },
        });
    }

    /**
     * Toggle skill's enabled status
     * @param skillId - The Skill object ID
     */
    async toggleSkill(skillId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::skill_manager::toggle_skill`,
            arguments: [tx.object(skillId)],
        });

        return await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer: this.signer,
            options: {
                showEffects: true,
            },
        });
    }
} 