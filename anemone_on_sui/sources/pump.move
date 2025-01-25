module anemone::pump {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::math;
    use sui::sui::SUI;
    use cetus_clmm::pool_creator;
    use cetus_clmm::config::GlobalConfig;
    use cetus_clmm::factory::Pools as CetusPools;
    use cetus_clmm::pool::{Self,Pool as CetusPool};
    use cetus_clmm::position::{Self,Position};
    use cetus_clmm::tick_math;
    use sui::clock::Clock;
    use sui::coin::CoinMetadata;
    use sui::event;
    use anemone::bonding_curve;

    const DECIMALS: u64 = 1_000_000_000;
    const MAX_SUPPLY: u64 = 1_000_000_000 * DECIMALS;
    const FUNDING_SUI: u64 = 20000 * DECIMALS;
    const FUNDING_TOKEN: u64 = (MAX_SUPPLY * 4) / 5;

    const EInsufficientSUI: u64 = 301;
    const EInsufficientTokenSupply: u64 = 302;
    const EInsufficientToken: u64 = 303;
    const EInsufficientCollateralBalance: u64 = 304;
    const ECollateralStatusInvalid: u64 = 305; 

    const TICK_SPACING: u32 = 60;

    // === Structs ===

    public enum CollateralStatus has copy,store,drop{
        FUNDING,
        LIQUIDITY_POOL_PENDING, // Waiting for liquidity creation
        LIQUIDITY_POOL_CREATED, // Liquidity creation completed
    }

    public struct Collateral<phantom T> has key {
        id: UID,
        sui_balance: Balance<SUI>,
        status: CollateralStatus
    }

    public struct TreasuryCapHolder<phantom T> has key {
        id: UID,
        treasury_cap: TreasuryCap<T>
    }

    public struct PositionHolder<phantom T> has key {
        id: UID,
        position: Position
    }

    // === Events ===



    public struct TokenStatusEvent<phantom T> has copy, drop {
        total_supply: u64,
        collected_sui: u64,
        status: CollateralStatus
    }


    // === Entry Functions ===

    /// Wrap treasury_cap so users can only mint or burn tokens under the constraints of this contract
    public entry fun create_collateral<T>(
        treasury_cap: TreasuryCap<T>,
        ctx: &mut TxContext
    ) {

        let collateral = Collateral<T> {
            id: object::new(ctx),
            sui_balance: balance::zero(),
            status: CollateralStatus::FUNDING
        };

        let treasury_cap_holder = TreasuryCapHolder<T> {
            id: object::new(ctx),
            treasury_cap,
        };

        transfer::share_object(collateral);
        transfer::share_object(treasury_cap_holder)
    }

    public entry fun buy<T>(
        collateral: &mut Collateral<T>,
        treasury_cap_holder: &mut TreasuryCapHolder<T>,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(collateral.status == CollateralStatus::FUNDING, ECollateralStatusInvalid);
        let payment_value = coin::value(&payment);
        assert!(payment_value > 0, EInsufficientSUI);

        let mut payment_balance = coin::into_balance(payment);
        
        let current_pool_balance = balance::value(&collateral.sui_balance);
        let actual_payment_value = if (current_pool_balance + payment_value > FUNDING_SUI) {
            // If exceeding funding target, calculate actual required amount
            let refund_amount = (current_pool_balance + payment_value) - FUNDING_SUI;
            // Split the refund amount from payment amount
            let refund_balance = balance::split(&mut payment_balance, refund_amount);
            // Create refund coin and transfer to user
            let refund_coin = coin::from_balance(refund_balance, ctx);
            transfer::public_transfer(
                refund_coin,
                tx_context::sender(ctx)
            );
            payment_value - refund_amount
        } else {
            payment_value
        };

        let current_supply = coin::total_supply(&treasury_cap_holder.treasury_cap);
        let token_amount = bonding_curve::calculate_buy_amount(actual_payment_value, current_supply);
        
        assert!(
            current_supply + token_amount <= MAX_SUPPLY,
            EInsufficientTokenSupply
        );

        // Add actual payment amount to pool
        balance::join(
            &mut collateral.sui_balance,
            payment_balance
        );

        coin::mint_and_transfer(
            &mut treasury_cap_holder.treasury_cap,
            token_amount,
            tx_context::sender(ctx),
            ctx
        );

        if (balance::value(&collateral.sui_balance) >= FUNDING_SUI) {
            collateral.status = CollateralStatus::LIQUIDITY_POOL_PENDING;
        };


        event::emit(TokenStatusEvent<T> {
            total_supply: (coin::total_supply(&treasury_cap_holder.treasury_cap) as u64),
            collected_sui: (balance::value(&collateral.sui_balance) as u64),
            status: collateral.status
        });
    }

    public entry fun sell<T>(
        collateral: &mut Collateral<T>,
        treasury_cap_holder: &mut TreasuryCapHolder<T>,
        token_coin: Coin<T>,
        ctx: &mut TxContext
    ) {
        assert!(collateral.status == CollateralStatus::FUNDING, ECollateralStatusInvalid);
        let token_amount = coin::value(&token_coin);
        assert!(token_amount > 0, EInsufficientToken);

        let current_supply = coin::total_supply(&treasury_cap_holder.treasury_cap);
        let sui_return = bonding_curve::calculate_sell_return(token_amount, current_supply);

        let collateral_balance = balance::value(&collateral.sui_balance);
        assert!(
            collateral_balance >= sui_return,
            EInsufficientCollateralBalance
        );

        coin::burn(
            &mut treasury_cap_holder.treasury_cap,
            token_coin
        );

        let sui_coin = coin::from_balance(
            balance::split(&mut collateral.sui_balance, sui_return),
            ctx
        );
        transfer::public_transfer(sui_coin, tx_context::sender(ctx));

        
        event::emit(TokenStatusEvent<T> {
            total_supply: (coin::total_supply(&treasury_cap_holder.treasury_cap) as u64),
            collected_sui: (balance::value(&collateral.sui_balance) as u64),
            status: collateral.status
        });
    }
    // Create Cetus liquidity pool
    public entry fun create_cetus_pool<T>(
        collateral: &mut Collateral<T>,
        treasury_cap_holder: &mut TreasuryCapHolder<T>,
        config: &GlobalConfig,
        cetus_pools: &mut CetusPools,
        metadata_t: &CoinMetadata<T>,
        metadata_sui: &CoinMetadata<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(collateral.status == CollateralStatus::LIQUIDITY_POOL_PENDING, ECollateralStatusInvalid);
        // Mint tokens
        let mut pool_tokens = coin::mint(
            &mut treasury_cap_holder.treasury_cap,
            MAX_SUPPLY - FUNDING_TOKEN,
            ctx
        );

        // Take raised SUI from pool
        let mut pool_sui = coin::from_balance(
            balance::split(&mut collateral.sui_balance, FUNDING_SUI),
            ctx
        );

        // Create Cetus liquidity pool
        let (position, remaining_coin_a, remaining_coin_b) = 
            pool_creator::create_pool_v2<T, SUI>(
                config,
                cetus_pools,
                TICK_SPACING,
                184467440737095516,
                std::string::utf8(b""),
                4294523716,
                443580,
                pool_tokens,
                pool_sui,
                metadata_t,
                metadata_sui,
                true, // fix_amount_a
                clock,
                ctx
            );

        // Return to caller
        transfer::public_transfer(remaining_coin_a, tx_context::sender(ctx));
        transfer::public_transfer(remaining_coin_b, tx_context::sender(ctx));
        
        let position_holder = PositionHolder<T> {
            id: object::new(ctx),
            position, 
        };
        transfer::share_object(position_holder);
        collateral.status = CollateralStatus::LIQUIDITY_POOL_CREATED;
        event::emit(TokenStatusEvent<T> {
            total_supply: (coin::total_supply(&treasury_cap_holder.treasury_cap) as u64),
            collected_sui: (balance::value(&collateral.sui_balance) as u64),
            status: collateral.status
        });
    }

}
