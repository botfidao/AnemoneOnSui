import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, OBJECTS } from "./config";

export class RoleManager {


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

        return tx;
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

        return tx;
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

        return tx;
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

        return tx;
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

        return tx;
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
                tx.object(skillId)
            ],
        });

        return tx;
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

        return tx;
    }

    /**
     * Withdraw SUI using Bot NFT ownership verification
     * @param roleId - The Role object ID
     * @param botNftId - The Bot NFT object ID
     * @param amount - Amount of SUI to withdraw (in MIST)
     */
    async withdrawSuiWithNft(
        roleId: string,
        botNftId: string,
        amount: bigint
    ) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::withdraw_sui_with_nft`,
            arguments: [
                tx.object(roleId),
                tx.object(botNftId),
                tx.pure.u64(amount)
            ],
        });

        return tx;
    }

    /**
     * Withdraw SUI using bot address verification
     * @param roleId - The Role object ID
     * @param amount - Amount of SUI to withdraw (in MIST)
     */
    async withdrawSuiAsBot(
        roleId: string,
        amount: bigint
    ) {
        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::role_manager::withdraw_sui_as_bot`,
            arguments: [
                tx.object(roleId),
                tx.pure.u64(amount)
            ],
        });

        return tx;
    }
} 