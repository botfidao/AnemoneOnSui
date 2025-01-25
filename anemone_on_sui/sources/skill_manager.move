module anemone::skill_manager {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::ascii::String;
    use anemone::role_manager::Role;

    // Error codes
    const ERR_INSUFFICIENT_PAYMENT: u64 = 201;
    const ERR_INVALID_AUTHOR: u64 = 202;
    const ERR_SKILL_DISABLED: u64 = 203;

    /// Skill object definition
    public struct Skill has key, store {
        id: UID,
        name: String,
        description: String,
        doc: String,
        fee: u64,
        author: address,
        is_enabled: bool,
    }

    /// Create a new skill
    public entry fun create_skill(
        name: String,
        description: String,
        doc: String,
        fee: u64,
        ctx: &mut TxContext
    ) {
        let skill = Skill {
            id: object::new(ctx),
            name,
            description,
            doc,
            fee,
            author: tx_context::sender(ctx),
            is_enabled: true,
        };

        transfer::share_object(skill);
    }

    /// Update skill details
    public entry fun update_skill(
        skill: &mut Skill,
        name: String,
        description: String,
        doc: String,
        fee: u64,
        ctx: &mut TxContext
    ) {
        // Only author can update the skill
        assert!(
            tx_context::sender(ctx) == skill.author,
            ERR_INVALID_AUTHOR
        );

        skill.name = name;
        skill.description = description;
        skill.doc = doc;
        skill.fee = fee;
    }

    /// Toggle skill enabled status
    public entry fun toggle_skill(
        skill: &mut Skill,
        ctx: &mut TxContext
    ) {
        assert!(
            tx_context::sender(ctx) == skill.author,
            ERR_INVALID_AUTHOR
        );
        skill.is_enabled = !skill.is_enabled;
    }

    /// Check if skill is enabled
    public fun is_enabled(skill: &Skill): bool {
        skill.is_enabled
    }
}
