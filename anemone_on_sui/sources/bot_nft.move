module anemone::bot_nft {
    use nft_protocol::attributes::{Self, Attributes};
    use nft_protocol::collection;
    use nft_protocol::display_info;
    use nft_protocol::mint_cap::{Self, MintCap};
    use nft_protocol::mint_event;
    use ob_permissions::witness;
    use std::ascii::String;
    use std::string;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::vec_map;

    /// One-time witness for module initialization
    public struct BOT_NFT has drop {}

    /// Witness for authorization
    public struct Witness has drop {}

    /// The Bot NFT that represents ownership
    public struct BotNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        attributes: Attributes,
    }

    // Initialize module
    fun init(otw: BOT_NFT, ctx: &mut TxContext) {
        let (mut collection, mint_cap) = collection::create_with_mint_cap<BOT_NFT, BotNFT>(
            &otw, option::none(), ctx
        );
        let delegated_witness = witness::from_witness(Witness {});

        collection::add_domain(
            delegated_witness,
            &mut collection,
            display_info::new(
                string::utf8(b"Anemone Bot"),
                string::utf8(
                    b"A NFT collection representing ownership of Anemone bots"
                ),
            ),
        );

        transfer::public_share_object(collection);
        transfer::public_share_object(mint_cap);
    }

    /// Mint new Bot NFT
    public(package) fun mint_bot_nft(
        mint_cap: &MintCap<BotNFT>,
        name: String,
        description: String,
        img_url: String,
        ctx: &mut TxContext,
    ): BotNFT {
        let nft = BotNFT {
            id: object::new(ctx),
            name,
            description,
            url: url::new_unsafe(img_url),
            attributes: attributes::from_vec(vector[], vector[]),
        };

        mint_event::emit_mint(
            witness::from_witness(Witness {}),
            mint_cap::collection_id(mint_cap),
            &nft,
        );
        nft
    }

    /// Add new attributes to the NFT
    public fun add_attributes(
        nft: &mut BotNFT,
        attribute_name: String,
        attribute_value: String
    ) {
        let mut new_attributes = vec_map::empty<String, String>();
        vec_map::insert(
            &mut new_attributes,
            attribute_name,
            attribute_value
        );
        attributes::add_new(&mut nft.id, new_attributes);
    }

    /// Transfer NFT to a new owner
    public entry fun transfer_nft(nft: BotNFT, to: address) {
        transfer::public_transfer(nft, to);
    }

}
