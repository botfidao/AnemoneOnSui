module anemone::role_manager {

    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::option::Option;
    use anemone::bot_nft::{Self, BotNFT};
    use nft_protocol::mint_cap::{Self, MintCap};
    use std::ascii::String;
    use anemone::skill_manager::{Self, Skill};

    // Constants for health and epochs
    const DECIMAI: u64 = 1_000_000_000;
    const INITIAL_HEALTH: u64 = 100 * DECIMAI;
    const HEALTH_DECAY_PER_EPOCH: u64 = 1 * DECIMAI; // Amount of health lost per epoch
    const MAX_INACTIVE_EPOCHS: u64 = 100; // Epochs after which the role becomes dormant
    const MIN_ACTIVATION_HEALTH: u64 = 1 * DECIMAI;
    const HEALTH_PER_SUI: u64 = 100;

    /// Error codes
    const ERR_ROLE_ALREADY_ACTIVE: u64 = 101;
    const ERR_INSUFFICIENT_FUNDS: u64 = 102;
    const ERR_NOT_AUTHORIZED: u64 = 103;
    const ERR_NOT_BOT_ADDRESS: u64 = 104;
    const ERR_SKILL_ALREADY_EXISTS: u64 = 105;
    const ERR_SKILL_NOT_FOUND: u64 = 106;
    const ERR_SKILL_NOT_ENABLED: u64 = 107;

    /// Role object definition
    public struct Role has key, store {
        id: UID, // Unique identifier
        bot_nft_id: ID, // NFT bot ID
        health: u64, // Health points
        is_active: bool, // Activation status
        is_locked: bool, // Locked status for trading
        last_epoch: u64, // Last epoch the role was updated
        inactive_epochs: u64, // Number of consecutive inactive epochs
        balance: Balance<SUI>,
        bot_address: address, // the authorized bot address
        skills: vector<Skill>
    }

    /// Create a new Role
    public entry fun create_role(
        bot_address: address,
        mint_cap: &MintCap<BotNFT>,
        name: String,
        description: String,
        img_url: String,
        coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let balance = coin::value(&coin);
        assert!(
            balance >= INITIAL_HEALTH / HEALTH_PER_SUI,
            ERR_INSUFFICIENT_FUNDS
        );
        let bot_nft = bot_nft::mint_bot_nft(
            mint_cap,
            name,
            description,
            img_url,
            ctx
        );

        let role = Role {
            id: object::new(ctx),
            health: INITIAL_HEALTH,
            bot_nft_id: object::id(&bot_nft),
            is_active: true,
            is_locked: false,
            last_epoch: tx_context::epoch(ctx),
            inactive_epochs: 0,
            balance: coin::into_balance(coin),
            bot_address: bot_address,
            skills: vector::empty()
        };

        transfer::share_object(role);
        transfer::public_transfer(bot_nft, tx_context::sender(ctx));
    }

    /// Deposit SUI to Maintain or Restore Health
    public entry fun deposit_sui(
        role: &mut Role,
        coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let balance = coin::value(&coin);
        assert!(balance > 0, ERR_INSUFFICIENT_FUNDS);

        // Transfer the deposited SUI
        balance::join(
            &mut role.balance,
            coin::into_balance(coin)
        );

        // Increase health (cap at INITIAL_HEALTH)
        role.health = role.health + (balance * HEALTH_PER_SUI);
        if (role.health > INITIAL_HEALTH) {
            role.health = INITIAL_HEALTH;
        };

        // Reset inactive epoch counter and update the last epoch
        role.inactive_epochs = 0;
        role.last_epoch = tx_context::epoch(ctx);
    }

    /// Update Role Health Per Epoch
    public entry fun update_role_health(role: &mut Role, ctx: &mut TxContext) {
        // Only bot address can call this function
        assert!(
            tx_context::sender(ctx) == role.bot_address,
            ERR_NOT_BOT_ADDRESS
        );

        let current_epoch = tx_context::epoch(ctx);

        // Calculate the number of epochs since the last update
        let epochs_since_last_update = current_epoch - role.last_epoch;

        if (epochs_since_last_update > 0) {
            // Decrease health for each elapsed epoch
            let total_decay = epochs_since_last_update * HEALTH_DECAY_PER_EPOCH;
            if (role.health > total_decay) {
                role.health = role.health - total_decay;
            } else {
                role.health = 0;
            };

            // Update inactive epochs if health is 0
            if (role.health == 0) {
                role.inactive_epochs = role.inactive_epochs + epochs_since_last_update;
            } else {
                role.inactive_epochs = 0; // Reset if health is maintained
            };

            // Mark the role as dormant if inactive for too long
            if (role.inactive_epochs >= MAX_INACTIVE_EPOCHS) {
                role.is_active = false;
            };

            // Update the last epoch
            role.last_epoch = current_epoch;
        }
    }

    /// Activate a Role
    public entry fun activate_role(role: &mut Role, bot_nft: &BotNFT,) {
        let bot_nft_id = object::id(bot_nft);

        assert!(
            bot_nft_id == role.bot_nft_id,
            ERR_NOT_AUTHORIZED
        );

        // Ensure the role is not already active
        assert!(
            !role.is_active,
            ERR_ROLE_ALREADY_ACTIVE
        );

        assert!(
            role.health >= MIN_ACTIVATION_HEALTH,
            ERR_INSUFFICIENT_FUNDS
        );

        role.is_active = true;

    }

    /// Lock or Unlock a Role
    public entry fun toggle_lock(role: &mut Role, bot_nft: &BotNFT,) {
        let bot_nft_id = object::id(bot_nft);

        assert!(
            bot_nft_id == role.bot_nft_id,
            ERR_NOT_AUTHORIZED
        );

        role.is_locked = !role.is_locked; // Toggle the locked status
    }

    /// Deactivate a Role
    public entry fun deactivate_role(role: &mut Role, bot_nft: &BotNFT) {
        let bot_nft_id = object::id(bot_nft);

        assert!(
            bot_nft_id == role.bot_nft_id,
            ERR_NOT_AUTHORIZED
        );

        role.is_active = false;
    }

    /// Add a skill to the role
    public entry fun add_skill(
        role: &mut Role,
        bot_nft: &BotNFT,
        skill: &Skill,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        let bot_nft_id = object::id(bot_nft);
        assert!(
            bot_nft_id == role.bot_nft_id,
            ERR_NOT_AUTHORIZED
        );

        // Check if skill is enabled
        assert!(
            skill_manager::is_enabled(skill),
            ERR_SKILL_NOT_ENABLED
        );

        // Check if skill already exists
        let skill_id = object::id(skill);
        let mut i = 0;
        let len = vector::length(&role.skills);
        while (i < len) {
            let existing_skill = vector::borrow(&role.skills, i);
            assert!(
                object::id(existing_skill) != skill_id,
                ERR_SKILL_ALREADY_EXISTS
            );
            i = i + 1;
        };

        // Add skill to role
        vector::push_back(&mut role.skills, *skill);
    }

    /// Remove a skill from the role
    public entry fun remove_skill(
        role: &mut Role,
        bot_nft: &BotNFT,
        skill_id: ID,
    ) {
        // Verify ownership
        let bot_nft_id = object::id(bot_nft);
        assert!(
            bot_nft_id == role.bot_nft_id,
            ERR_NOT_AUTHORIZED
        );

        // Find and remove skill
        let i = 0;
        let len = vector::length(&role.skills);
        let found = false;
        while (i < len) {
            let skill = vector::borrow(&role.skills, i);
            if (object::id(skill) == skill_id) {
                vector::remove(&mut role.skills, i);
                found = true;
                break
            };
            i = i + 1;
        };

        assert!(found, ERR_SKILL_NOT_FOUND);
    }

}
