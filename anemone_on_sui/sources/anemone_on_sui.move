module anemone::role_manager {

    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::option::Option;

    // Constants for health and epochs
    const INITIAL_HEALTH: u64 = 100;
    const HEALTH_DECAY_PER_EPOCH: u64 = 1;  // Amount of health lost per epoch
    const MAX_INACTIVE_EPOCHS: u64 = 100;  // Epochs after which the role becomes dormant


    /// Error codes
    const ERR_NOT_OWNER: u64 = 200;
    const ERR_ROLE_ALREADY_ACTIVE: u64 = 101;
    const ERR_INSUFFICIENT_FUNDS: u64 = 201;

    /// Role object definition
    public struct Role has key, store {
        id: UID,              // Unique identifier
        owner: address,       // Owner's address
        health: u64,          // Health points
        is_active: bool,      // Activation status
        is_locked: bool,      // Locked status for trading
        special_state: Option<vector<u8>>, // Special state (e.g., "Soul Frozen")
        last_epoch: u64,       // Last epoch the role was updated
        inactive_epochs: u64,  // Number of consecutive inactive epochs
    }

    /// Create a new Role
    public entry fun create_role(owner: &signer, ctx: &mut TxContext) {
        let id = object::new(ctx);
        let current_epoch = tx_context::current_epoch(ctx);
        let role = Role {
            id,
            owner: signer::address_of(owner), // Initialize the owner address
            health: 100,                     // Initialize health points
            is_active: false,                // Initialize as inactive
            is_locked: false,                // Initialize as unlocked
            special_state: Option::none(),   // Initialize special_state as None
            last_epoch: current_epoch,       // Set the current epoch
            inactive_epochs: 0,              // Initialize inactive epochs
        };

        // Store the Role object in the owner's address
        move_to(owner, role);
    }

    /// Deposit SUI to Maintain or Restore Health
    public entry fun deposit_sui(role: &mut Role, coin: Coin<SUI>, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), ERR_NOT_OWNER);

        let balance = coin::value(&coin);
        assert!(balance > 0, ERR_INSUFFICIENT_FUNDS);

        // Transfer the deposited SUI
        coin::transfer(coin, recipient, ctx);

        // Increase health (cap at INITIAL_HEALTH)
        role.health = role.health + balance;
        if role.health > INITIAL_HEALTH {
            role.health = INITIAL_HEALTH;
        }

        // Reset inactive epoch counter and update the last epoch
        role.inactive_epochs = 0;
        role.last_epoch = tx_context::current_epoch(ctx);
    }


    /// Update Role Health Per Epoch
    public entry fun update_role_health(role: &mut Role, ctx: &mut TxContext) {
        let current_epoch = tx_context::current_epoch(ctx);

        // Calculate the number of epochs since the last update
        let epochs_since_last_update = current_epoch - role.last_epoch;

        if epochs_since_last_update > 0 {
            // Decrease health for each elapsed epoch
            let total_decay = epochs_since_last_update * HEALTH_DECAY_PER_EPOCH;
            if role.health > total_decay {
                role.health = role.health - total_decay;
            } else {
                role.health = 0;
            }

            // Update inactive epochs if health is 0
            if role.health == 0 {
                role.inactive_epochs = role.inactive_epochs + epochs_since_last_update;
            } else {
                role.inactive_epochs = 0; // Reset if health is maintained
            }

            // Mark the role as dormant if inactive for too long
            if role.inactive_epochs >= MAX_INACTIVE_EPOCHS {
                role.is_active = false;
            }

            // Update the last epoch
            role.last_epoch = current_epoch;
        }
    }

    /// Recharge Health Points
    public entry fun recharge_health(
        role: &mut Role,
        coin: Coin<SUI>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(role.owner == tx_context::sender(ctx), 200);

        // Transfer the deposited SUI
        let balance = coin::value(&coin);
        coin::transfer(coin, recipient, ctx);

        // Increase health (cap at INITIAL_HEALTH)
        role.health = role.health + balance;
        if role.health > INITIAL_HEALTH {
            role.health = INITIAL_HEALTH;
        }

        // Reset inactive epoch counter and update the last epoch
        role.inactive_epochs = 0;
        role.last_epoch = tx_context::current_epoch(ctx);
    }



    /// Activate a Role
    public entry fun activate_role(role: &mut Role, coin: Coin<u64>, recipient: address, ctx: &mut TxContext) {
        // Ensure the owner matches the sender
        assert!(
            role.owner == tx_context::sender(ctx),
            100 // Abort code: 100 indicates "Only the owner can activate this role"
        );

        // Ensure the role is not already active
        assert!(
            !role.is_active,
            101 // Abort code: 101 indicates "Role is already active"
        );

        // Check if the coin balance is sufficient
        let balance: u64 = coin::value(&coin);
        assert!(
            balance >= ACTIVATION_COST,
            102 // Abort code: 102 indicates "Insufficient funds to activate"
        );

        // Transfer the activation cost
        coin::transfer(coin, recipient, ctx);

        // Activate the role
        role.is_active = true;
    }


    /// Lock or Unlock a Role
    public entry fun toggle_lock(role: &mut Role, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), ERR_NOT_OWNER);

        role.is_locked = !role.is_locked; // Toggle the locked status
    }

    /// Set Special State for the Role
    public entry fun set_special_state(role: &mut Role, state: vector<u8>, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), ERR_NOT_OWNER);

        role.special_state = Option::some(state);
    }


    /// Clear Special State for the Role
    public entry fun clear_special_state(role: &mut Role, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), ERR_NOT_OWNER);

        role.special_state = Option::none();
    }


    /// Deactivate a Role
    public entry fun deactivate_role(role: &mut Role, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), ERR_NOT_OWNER);

        role.is_active = false;
    }


    /// Add Yield Data Tracking (Stub for Future Integration)
    public fun track_yield_data(role: &Role) {
        // Placeholder for tracking yield data logic
    }

    /// Recommend Strategies Based on Transactions (Stub for Future Integration)
    public fun recommend_strategy(role: &Role) {
        // Placeholder for strategy recommendation logic
    }

    /// Support Multiplayer Role Cultivation (Stub for Future Integration)
    public fun support_multiplayer(role: &Role) {
        // Placeholder for multiplayer role management
    }






/// Transfer ownership of a Role
    public entry fun transfer_role(role: &mut Role, new_owner: address, ctx: &mut TxContext) {
        assert!(role.owner == tx_context::sender(ctx), );
        role.owner = new_owner;
    }
}


