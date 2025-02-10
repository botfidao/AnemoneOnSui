import { SUI_DECIMALS } from "@mysten/sui/utils";

export interface TokenMetadata {
    symbol: string;
    decimals: number;
    tokenAddress: string;
}

export const tokens: Map<string, TokenMetadata> = new Map([
        [
            "SUI",
            {
                "symbol": "SUI",
                "decimals": 9,
                "tokenAddress": "0x2::sui::SUI"
            }
        ],
        [
            "wUSDC",
            {
                "symbol": "wUSDC",
                "decimals": 6,
                "tokenAddress": "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"
            }
        ],
        [
            "USDC",
            {
                "symbol": "USDC",
                "decimals": 6,
                "tokenAddress": "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
            }
        ],
        [
            "DEEP",
            {
                "symbol": "DEEP",
                "decimals": 6,
                "tokenAddress": "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP"
            }
        ],
        [
            "BUCK",
            {
                "symbol": "BUCK",
                "decimals": 9,
                "tokenAddress": "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK"
            }
        ],
        [
            "USDT",
            {
                "symbol": "USDT",
                "decimals": 6,
                "tokenAddress": "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN"
            }
        ],
        [
            "HIPPO",
            {
                "symbol": "HIPPO",
                "decimals": 9,
                "tokenAddress": "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG"
            }
        ],
        [
            "CETUS",
            {
                "symbol": "CETUS",
                "decimals": 9,
                "tokenAddress": "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS"
            }
        ],
        [
            "WETH",
            {
                "symbol": "WETH",
                "decimals": 8,
                "tokenAddress": "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN"
            }
        ],
        [
            "haSUI",
            {
                "symbol": "haSUI",
                "decimals": 9,
                "tokenAddress": "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI"
            }
        ],
        [
            "AFSUI",
            {
                "symbol": "AFSUI",
                "decimals": 9,
                "tokenAddress": "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI"
            }
        ],
        [
            "suiETH",
            {
                "symbol": "suiETH",
                "decimals": 8,
                "tokenAddress": "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH"
            }
        ],
        [
            "SOL",
            {
                "symbol": "SOL",
                "decimals": 8,
                "tokenAddress": "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN"
            }
        ],
        [
            "SCA",
            {
                "symbol": "SCA",
                "decimals": 9,
                "tokenAddress": "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA"
            }
        ],
        [
            "AWWW",
            {
                "symbol": "AWWW",
                "decimals": 9,
                "tokenAddress": "0x594b539e0020ca22f83e9a8f55c1fede4c5730130d5b100fcf01f98ddb4f94c8::awww::AWWW"
            }
        ],
        [
            "BLUB",
            {
                "symbol": "BLUB",
                "decimals": 2,
                "tokenAddress": "0xfa7ac3951fdca92c5200d468d31a365eb03b2be9936fde615e69f0c1274ad3a0::BLUB::BLUB"
            }
        ],
        [
            "UNI",
            {
                "symbol": "UNI",
                "decimals": 9,
                "tokenAddress": "0xaf9e228fd0292e2a27b4859bc57a2f3a9faedb9341b6307c84fef163e44790cc::uni::UNI"
            }
        ],
        [
            "WAVE",
            {
                "symbol": "WAVE",
                "decimals": 9,
                "tokenAddress": "0x334e12a41de2b23c2cf4d000e0162d6b200455d698f42e43cccceb09cae78600::wave::WAVE"
            }
        ],
        [
            "AAA",
            {
                "symbol": "AAA",
                "decimals": 6,
                "tokenAddress": "0xd976fda9a9786cda1a36dee360013d775a5e5f206f8e20f84fad3385e99eeb2d::aaa::AAA"
            }
        ],
        [
            "WBTC",
            {
                "symbol": "WBTC",
                "decimals": 8,
                "tokenAddress": "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN"
            }
        ],
        [
            "LAMA",
            {
                "symbol": "LAMA",
                "decimals": 6,
                "tokenAddress": "0x9cfca0061e5c920cd09ba39fa0ce27b73d97ac296eece7d3a44db3d818c35aad::lama::LAMA"
            }
        ],
        [
            "TRUMP",
            {
                "symbol": "TRUMP",
                "decimals": 6,
                "tokenAddress": "0x95a2728bedb8798c4a06eb67865912f837a8c95907396de662a3d4dc6aab514a::trump::TRUMP"
            }
        ],
        [
            "FUD",
            {
                "symbol": "FUD",
                "decimals": 5,
                "tokenAddress": "0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD"
            }
        ],
        [
            "NAVX",
            {
                "symbol": "NAVX",
                "decimals": 9,
                "tokenAddress": "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX"
            }
        ],
        [
            "TISM",
            {
                "symbol": "TISM",
                "decimals": 9,
                "tokenAddress": "0x6612c8419c70a706612e154ffcc0ef21b3fec6e4008b4b775ceae4e894d3484d::tism::TISM"
            }
        ],
        [
            "LOOPY",
            {
                "symbol": "LOOPY",
                "decimals": 6,
                "tokenAddress": "0x9b9c0e26a8ace7edb8fce14acd81507c507c677a400cfb9cc9a0ca4a8432a97a::loopy_sui::LOOPY_SUI"
            }
        ],
        [
            "SNWY",
            {
                "symbol": "SNWY",
                "decimals": 6,
                "tokenAddress": "0x439dc5b02f643131f94cfbfeb577bba3c02ff23b4e5158bad436f79293a37685::snwy::SNWY"
            }
        ],
        [
            "CERT",
            {
                "symbol": "CERT",
                "decimals": 9,
                "tokenAddress": "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT"
            }
        ],
        [
            "TURBOS",
            {
                "symbol": "TURBOS",
                "decimals": 9,
                "tokenAddress": "0x5d1f47ea69bb0de31c313d7acf89b890dbb8991ea8e03c6c355171f84bb1ba4a::turbos::TURBOS"
            }
        ],
        [
            "SUIMAN",
            {
                "symbol": "SUIMAN",
                "decimals": 6,
                "tokenAddress": "0xa8b69040684d576828475115b30cc4ce7c7743eab9c7d669535ee31caccef4f5::suiman::SUIMAN"
            }
        ],
        [
            "USDY",
            {
                "symbol": "USDY",
                "decimals": 6,
                "tokenAddress": "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY"
            }
        ],
        [
            "MAGABA",
            {
                "symbol": "MAGABA",
                "decimals": 9,
                "tokenAddress": "0x5eb1120eee2dd8a7ee23ce49b8680be7f604972a7936d0fdc3cd0540fb1f96f2::magaba::MAGABA"
            }
        ],
        [
            "AUSD",
            {
                "symbol": "AUSD",
                "decimals": 6,
                "tokenAddress": "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD"
            }
        ],
        [
            "sSUI",
            {
                "symbol": "sSUI",
                "decimals": 9,
                "tokenAddress": "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI"
            }
        ],
        [
            "KUN",
            {
                "symbol": "KUN",
                "decimals": 6,
                "tokenAddress": "0x48ec9faa68ebb8905e3f335345c82667cfba8fa860533089c9209ad3f1337c33::kun::KUN"
            }
        ],
        [
            "LIQ",
            {
                "symbol": "LIQ",
                "decimals": 6,
                "tokenAddress": "0x9c86d1926a0a39e906f20674d6a35f337be8625ebcb6b799ee8ff011f328bee2::liq::LIQ"
            }
        ],
        [
            "USDCsol",
            {
                "symbol": "USDCsol",
                "decimals": 6,
                "tokenAddress": "0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037::coin::COIN"
            }
        ],
        [
            "ALPHA",
            {
                "symbol": "ALPHA",
                "decimals": 9,
                "tokenAddress": "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA"
            }
        ],
        [
            "MBLUB",
            {
                "symbol": "MBLUB",
                "decimals": 9,
                "tokenAddress": "0x7c486f6723448de6c2a1515eb66fbc91d496063acfa0392b862aad11716ba960::mblub::MBLUB"
            }
        ],
        [
            "PIGU",
            {
                "symbol": "PIGU",
                "decimals": 5,
                "tokenAddress": "0xfc71274a94f5d9cd1ae6928ecfc9fa910d03eb28258fddeb9842ac3c7b4f3ae6::pigu::PIGU"
            }
        ],
        [
            "DAK",
            {
                "symbol": "DAK",
                "decimals": 6,
                "tokenAddress": "0x41636c138167952207c88f5a75e433c9e880bc7bd5e4e46047d82be266d36712::dak::DAK"
            }
        ],
        [
            "SUILAMA",
            {
                "symbol": "SUILAMA",
                "decimals": 6,
                "tokenAddress": "0x5a4f64079daed04d923c93f3ac4ee04b637e5b3ea2db87d591981c1049508a27::suilama::SUILAMA"
            }
        ],
        [
            "SUITRUMP",
            {
                "symbol": "SUITRUMP",
                "decimals": 6,
                "tokenAddress": "0xdeb831e796f16f8257681c0d5d4108fa94333060300b2459133a96631bf470b8::suitrump::SUITRUMP"
            }
        ],
        [
            "NAMI",
            {
                "symbol": "NAMI",
                "decimals": 6,
                "tokenAddress": "0xe7397f9f6a5a60010a729ed1a470130936f090cafcdc0cdca6c3260b17ac0c9b::nami::NAMI"
            }
        ],
        [
            "TRUMPNUT",
            {
                "symbol": "TRUMPNUT",
                "decimals": 9,
                "tokenAddress": "0x648e7d0963af4b351459701516d5ca5436d8c04da90915a4dad8430980d1b987::trumpnut::TRUMPNUT"
            }
        ],
        [
            "PLOP",
            {
                "symbol": "PLOP",
                "decimals": 6,
                "tokenAddress": "0x1c6cd615ed4c42a34977212a3407a28eec21acc572c8dbe7d0382bf0289a2590::plop::PLOP"
            }
        ],
        [
            "QNTM",
            {
                "symbol": "QNTM",
                "decimals": 9,
                "tokenAddress": "0xe975b0d8a476758c718a682fffaf27b86250eb2d35120739796d3884029c1a6e::qntm::QNTM"
            }
        ],
        [
            "SUIP",
            {
                "symbol": "SUIP",
                "decimals": 9,
                "tokenAddress": "0xe4239cd951f6c53d9c41e25270d80d31f925ad1655e5ba5b543843d4a66975ee::SUIP::SUIP"
            }
        ],
        [
            "SPLO",
            {
                "symbol": "SPLO",
                "decimals": 6,
                "tokenAddress": "0x782ed255787dd75961b8e1b0cb811cfca968e56d5221218556778f9b404da075::splo::SPLO"
            }
        ],
        [
            "superSUI",
            {
                symbol: "superSUI",
                decimals: 9,
                tokenAddress: "0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI"
            }
        ],
        [
            "mUSD",
            {
                symbol: "MUSD",
                decimals: 9,
                tokenAddress: "0xe44df51c0b21a27ab915fa1fe2ca610cd3eaa6d9666fe5e62b988bf7f0bd8722::musd::MUSD"
            }
        ],
        [
            "KDX",
            {
                symbol: "KDX",
                decimals: 6,
                tokenAddress: "0x3b68324b392cee9cd28eba82df39860b6b220dc89bdd9b21f675d23d6b7416f1::kdx::KDX"
            }
        ],
        [
            "Bucket Token",
            {
                symbol: "BUT",
                decimals: 9,
                tokenAddress: "0xbc858cb910b9914bee64fff0f9b38855355a040c49155a17b265d9086d256545::but::BUT"
            }
        ],
        [
            "suiUSDT",
            {
                symbol: "suiUSDT",
                decimals: 6,
                tokenAddress: "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT"
            }
        ],
        [
            "0xWSB on SUI",
            {
                symbol: "WSB",
                decimals: 6,
                tokenAddress: "0x4db126eac4fa99207e98db61d968477021fdeae153de3b244bcfbdc468ef0722::wsb::WSB"
            }
        ],
        [
            "AlphaFi Staked SUI",
            {
                symbol: "stSUI",
                decimals: 9,
                tokenAddress: "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI"
            }
        ],
        [
            "First Digital USD",
            {
                symbol: "FDUSD",
                decimals: 6,
                tokenAddress: "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD"
            }
        ],
        [
            "SEND",
            {
                symbol: "SEND",
                decimals: 6,
                tokenAddress: "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND"
            }
        ],
        [
            "Bluefin",
            {
                symbol: "BLUE",
                decimals: 9,
                tokenAddress: "0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE"
            }
        ],
        [
            "$DRF",
            {
                symbol: "DRF",
                decimals: 6,
                tokenAddress: "0x294de7579d55c110a00a7c4946e09a1b5cbeca2592fbb83fd7bfacba3cfeaf0e::drf::DRF"
            }
        ],
        [
            "Typus",
            {
                symbol: "TYPUS",
                decimals: 9,
                tokenAddress: "0xf82dc05634970553615eef6112a1ac4fb7bf10272bf6cbe0f80ef44a6c489385::typus::TYPUS"
            }
        ],
        [
            "SuiNS Token",
            {
                symbol: "NS",
                decimals: 6,
                tokenAddress: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS"
            }
        ],
        [
            "USDCbnb",
            {
                symbol: "USDCbnb",
                decimals: 8,
                tokenAddress: "0x909cba62ce96d54de25bec9502de5ca7b4f28901747bbf96b76c2e63ec5f1cba::coin::COIN"
            }
        ],
        [
            "Pyth Network",
            {
                symbol: "PYTH",
                decimals: 6,
                tokenAddress: "0x9c6d76eb273e6b5ba2ec8d708b7fa336a5531f6be59f326b5be8d4d8b12348a4::coin::COIN"
            }
        ],
        [
            "Volo Staked SUI",
            {
                symbol: "vSUI",
                decimals: 9,
                tokenAddress: "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT"
            }
        ],
]);

export const getTokenMetadata = (symbol: string) => {
    return tokens.get(symbol.toUpperCase());
};

export const getAmount = (amount: string, meta: TokenMetadata) => {
    const v = parseFloat(amount);
    return BigInt(v * 10 ** meta.decimals);
};
