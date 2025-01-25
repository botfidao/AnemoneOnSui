module anemone::bonding_curve {
    use legato_math::fixed_point64::{Self, FixedPoint64};
    use legato_math::math_fixed64;
    use legato_math::legato_math;

    const B: u128 = 5;

    const A: u128 = 1866;

    const DECIMALS: u128 = 1_000_000_000;


    /// Returns value with specified precision
    public fun get_value_with_precision(num: FixedPoint64, precision: u8): u128 {
        let raw = fixed_point64::get_raw_value(num);
        let mut scale = 1u128;
        let mut i = 0u8;
        while (i < precision) {
            scale = scale * 10;
            i = i + 1;
        };
        
        // Convert 64-bit fixed point number to specified precision
        // First right shift 64 bits to get integer part
        let integer = raw >> 64;
        // Get fractional part and scale it
        let frac = raw & ((1u128 << 64) - 1);
        let scaled_frac = (frac * scale) >> 64;
        
        integer * scale + scaled_frac
    }

    /// Calculate buy amount
    /// delta_y: Amount of funds invested
    /// x_0: Current token amount in pool
    public entry fun calculate_buy_amount(delta_y: u64, x_0: u64): u64 {
        // Convert input to FixedPoint64
        let x0_fixed = fixed_point64::create_from_rational((x_0 as u128), DECIMALS);
        let  b_fixed = fixed_point64::create_from_rational(B, DECIMALS);
        let  a_fixed = fixed_point64::create_from_rational(A, DECIMALS);
        let dy_fixed = fixed_point64::create_from_rational((delta_y as u128 ),DECIMALS);

        // Calculate exp(b*x0)
        let b_x0 = math_fixed64::mul_div(
            b_fixed,
            x0_fixed,
            fixed_point64::create_from_u128(1)
        );
        let exp_b_x0 = math_fixed64::exp(b_x0);

        // Calculate dy*b/a
        let dy_b = math_fixed64::mul_div(dy_fixed, b_fixed, a_fixed);

        // Calculate exp(b*x0) + (dy*b/a)
        let exp_b_x1 = fixed_point64::add(exp_b_x0, dy_b);

        // Calculate ln(exp_b_x1)
        let ln_exp_b_x1 = legato_math::ln(exp_b_x1);

        // Calculate ln(exp_b_x1)/b
        let result = math_fixed64::mul_div(
            ln_exp_b_x1,
            fixed_point64::create_from_u128(1),
            b_fixed
        );

        // Calculate ln(exp_b_x1)/b - x0
        let delta_x = fixed_point64::sub(result, x0_fixed);
        
        get_value_with_precision(delta_x, 9) as u64
    }

    /// Calculate return amount when selling
    /// delta_x: Amount of tokens to sell
    /// x_0: Current token amount in pool
    public entry fun calculate_sell_return(delta_x: u64, x_0: u64): u64 {
        // Convert input to FixedPoint64
        let x0_fixed = fixed_point64::create_from_rational((x_0 as u128), DECIMALS);
        let dx_fixed = fixed_point64::create_from_rational((delta_x as u128), DECIMALS);
        let b_fixed = fixed_point64::create_from_rational(B, DECIMALS);
        let a_fixed = fixed_point64::create_from_rational(A, DECIMALS);

        // Calculate exp(b*x0)
        let b_x0 = math_fixed64::mul_div(
            b_fixed,
            x0_fixed,
            fixed_point64::create_from_u128(1)
        );
        let exp_b_x0 = math_fixed64::exp(b_x0);

        // Calculate exp(b*(x0-dx))
        let x1_fixed = fixed_point64::sub(x0_fixed, dx_fixed);
        let b_x1 = math_fixed64::mul_div(
            b_fixed,
            x1_fixed,
            fixed_point64::create_from_u128(1)
        );
        let exp_b_x1 = math_fixed64::exp(b_x1);

        // Calculate exp(b*x0) - exp(b*x1)
        let delta_exp = fixed_point64::sub(exp_b_x0, exp_b_x1);

        // Calculate (a/b)*(exp(b*x0) - exp(b*x1))
        let result = math_fixed64::mul_div(a_fixed, delta_exp, b_fixed);


        get_value_with_precision(result, 9) as u64
    }

    #[test]
    fun test_buy_amount() {
        let delta_y = DECIMALS as u64;
        let x_0 = 0;
        let result = calculate_buy_amount(delta_y, x_0);
        std::debug::print(&result);
    }

    #[test]
    fun test_find_a_b() {
        // Base parameters
        let total_supply: u128 = 1_000_000_000 * DECIMALS;  // 1 billion tokens
        let funding_token: u128 = total_supply * 4 / 5;  // 800 million tokens for fundraising
        let funding_sui: u128 = 20_000 * DECIMALS;  // Target fundraising amount
        let amm_token: u128 = total_supply - funding_token;  // 200 million tokens
        
        // Calculate target AMM price C = funding_sui / amm_token
        let target_price = fixed_point64::create_from_rational(funding_sui, amm_token);
        
        let mut best_b: u128 = 0;
        let mut best_a: u128 = 0;
        let mut min_diff = fixed_point64::create_from_u128(100000); // Set a large initial difference
        
        let mut b = 1u128;
        while (b <= 100) {
            let mut a = 1u128;
            while (a <= 2000) {
                // Calculate bonding curve price at funding_token
                let b_fixed = fixed_point64::create_from_rational(b, DECIMALS);
                let a_fixed = fixed_point64::create_from_rational(a, DECIMALS);
                
                // Calculate b * funding_token
                let b_x = math_fixed64::mul_div(
                    b_fixed,
                    fixed_point64::create_from_rational(funding_token, DECIMALS),
                    fixed_point64::create_from_u128(1)
                );
                
                // Calculate exp(b * funding_token)
                let exp_b_x = math_fixed64::exp(b_x);
                
                // Calculate a * exp(b * funding_token), which is bonding curve price
                let bc_price = math_fixed64::mul_div(a_fixed, exp_b_x, fixed_point64::create_from_u128(1));
                
                // Calculate price difference
                let price_diff = if (fixed_point64::greater_or_equal(bc_price, target_price)) {
                    fixed_point64::sub(bc_price, target_price)
                } else {
                    fixed_point64::sub(target_price, bc_price)
                };
                
                // If found smaller difference, update best result
                if (fixed_point64::less(price_diff, min_diff)) {
                    min_diff = price_diff;
                    best_a = a;
                    best_b = b;
                    
                    // Output current best result
                    std::debug::print(&b);
                    std::debug::print(&a);
                    std::debug::print(&get_value_with_precision(bc_price, 9));
                    std::debug::print(&get_value_with_precision(target_price, 9));
                    std::debug::print(&get_value_with_precision(min_diff, 9));

                    if (get_value_with_precision(min_diff, 9) == 0) {
                        b = 110;
                        break  
                    };
                };
                
                a = a + 1;
            };
            b = b + 1;
        };
        
        // Verify found result
        assert!(best_a > 0 && best_b > 0, 0);
    }


}
