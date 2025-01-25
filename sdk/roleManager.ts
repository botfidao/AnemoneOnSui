import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID, OBJECTS } from "./config";

export class RoleManager {
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
     * Create a new Role
     * @param botAddress - The authorized bot address
     * @param name - Role name
     * @param description - Role description
     * @param imgUrl - Role image URL
     * @param suiAmount - Amount of SUI to deposit (in MIST)
     */
    async createRole(
        botAddress: string,
        name: string,
        description: string,
        imgUrl: string,
        suiAmount: bigint
    ) {
        const tx = new Transaction();
        
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmount)]);

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::create_role`,
            arguments: [
                tx.pure.address(botAddress),
                tx.object(OBJECTS.MINT_CAP_ID),
                tx.pure.string(name),
                tx.pure.string(description),
                tx.pure.string(imgUrl),
                coin
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
     * Deposit SUI to maintain or restore Role's health
     * @param roleId - The Role object ID
     * @param suiAmount - Amount of SUI to deposit (in MIST)
     */
    async depositSui(roleId: string, suiAmount: bigint) {
        const tx = new Transaction();
        
        // Create coin for deposit
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmount)]);

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::deposit_sui`,
            arguments: [tx.object(roleId), coin],
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
     * Update role's health (can only be called by bot address)
     * @param roleId - The Role object ID
     */
    async updateRoleHealth(roleId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::update_role_health`,
            arguments: [tx.object(roleId)],
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
     * Activate a role
     * @param roleId - The Role object ID
     * @param botNftId - The Bot NFT object ID
     */
    async activateRole(roleId: string, botNftId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::activate_role`,
            arguments: [tx.object(roleId), tx.object(botNftId)],
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
     * Toggle role's lock status
     * @param roleId - The Role object ID
     * @param botNftId - The Bot NFT object ID
     */
    async toggleLock(roleId: string, botNftId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::toggle_lock`,
            arguments: [tx.object(roleId), tx.object(botNftId)],
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
     * Add a skill to the role
     * @param roleId - The Role object ID
     * @param botNftId - The Bot NFT object ID
     * @param skillId - The Skill object ID
     */
    async addSkill(roleId: string, botNftId: string, skillId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::add_skill`,
            arguments: [
                tx.object(roleId),
                tx.object(botNftId),
                tx.pure.id(skillId)
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
     * Remove a skill from the role
     * @param roleId - The Role object ID
     * @param botNftId - The Bot NFT object ID
     * @param skillId - The Skill object ID to remove
     */
    async removeSkill(roleId: string, botNftId: string, skillId: string) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::remove_skill`,
            arguments: [
                tx.object(roleId),
                tx.object(botNftId),
                tx.pure.id(skillId)
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
} 