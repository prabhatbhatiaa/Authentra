module authentra::asset {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use authentra::access;

    // Error Codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_ASSET_ALREADY_EXISTS: u64 = 4;
    const E_ASSET_NOT_FOUND: u64 = 5;
    const E_ASSET_REVOKED: u64 = 6;
    const E_INVALID_OWNER: u64 = 7;

    // Asset Status Constants
    const STATUS_DRAFT: u8 = 0;
    const STATUS_MINTED: u8 = 1;
    const STATUS_ACTIVE: u8 = 2;
    const STATUS_REVOKED: u8 = 3;

    struct OwnershipRecord has store, copy, drop {
        owner: address,
        from_timestamp: u64,
        to_timestamp: u64, // 0 indicates active/current owner
        transfer_reason: String,
    }

    struct AssetRecord has store, copy, drop {
        asset_id: String,
        name: String,
        asset_type: String,
        metadata_hash: String,
        current_owner: address,
        status: u8,
        minted_at: u64,
        updated_at: u64,
        ownership_history: vector<OwnershipRecord>,
    }

    struct AssetStore has key {
        admin: address,
        assets: vector<AssetRecord>,
    }

    // Events
    #[event]
    struct AssetMinted has drop, store {
        asset_id: String,
        name: String,
        asset_type: String,
        metadata_hash: String,
        initial_owner: address,
        minted_by: address,
        minted_at: u64,
    }

    #[event]
    struct AssetAssigned has drop, store {
        asset_id: String,
        assigned_to: address,
        assigned_by: address,
        assigned_at: u64,
    }

    #[event]
    struct AssetTransferred has drop, store {
        asset_id: String,
        from_owner: address,
        to_owner: address,
        transferred_by: address,
        reason: String,
        transferred_at: u64,
    }

    #[event]
    struct AssetRevoked has drop, store {
        asset_id: String,
        revoked_by: address,
        reason: String,
        revoked_at: u64,
    }

    /// Initialize the Asset Store
    public entry fun initialize(account: &signer) {
        let admin_addr = signer::address_of(account);
        assert!(!exists<AssetStore>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(account, AssetStore {
            admin: admin_addr,
            assets: vector::empty<AssetRecord>(),
        });
    }

    /// Mint a new digital asset (Authorized Admin or Manager only)
    public entry fun mint_asset(
        account: &signer,
        asset_id: String,
        name: String,
        asset_type: String,
        metadata_hash: String,
        initial_owner: address
    ) acquires AssetStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);

        // Independent contract-level authorization check: Must be Admin or Manager
        assert!(access::is_manager_or_admin(caller_addr), E_NOT_AUTHORIZED);

        let store = borrow_global_mut<AssetStore>(store_addr);

        // Ensure asset ID does not exist already
        let len = vector::length(&store.assets);
        let i = 0;
        while (i < len) {
            let item = vector::borrow(&store.assets, i);
            assert!(item.asset_id != asset_id, E_ASSET_ALREADY_EXISTS);
            i = i + 1;
        };

        let now = timestamp::now_seconds();
        let history = vector::empty<OwnershipRecord>();
        vector::push_back(&mut history, OwnershipRecord {
            owner: initial_owner,
            from_timestamp: now,
            to_timestamp: 0,
            transfer_reason: std::string::utf8(b"INITIAL_MINT"),
        });

        let record = AssetRecord {
            asset_id,
            name,
            asset_type,
            metadata_hash,
            current_owner: initial_owner,
            status: STATUS_MINTED,
            minted_at: now,
            updated_at: now,
            ownership_history: history,
        };

        vector::push_back(&mut store.assets, record);

        event::emit(AssetMinted {
            asset_id,
            name,
            asset_type,
            metadata_hash,
            initial_owner,
            minted_by: caller_addr,
            minted_at: now,
        });
    }

    /// Assign an asset to a designated custodian / owner (Admin/Manager only)
    public entry fun assign_asset(
        account: &signer,
        asset_id: String,
        assigned_to: address
    ) acquires AssetStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);
        assert!(access::is_manager_or_admin(caller_addr), E_NOT_AUTHORIZED);

        let store = borrow_global_mut<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;
        let found = false;
        let now = timestamp::now_seconds();

        while (i < len) {
            let item = vector::borrow_mut(&mut store.assets, i);
            if (item.asset_id == asset_id) {
                assert!(item.status != STATUS_REVOKED, E_ASSET_REVOKED);
                
                // Close current ownership interval if owner changes
                if (item.current_owner != assigned_to) {
                    let h_len = vector::length(&item.ownership_history);
                    if (h_len > 0) {
                        let last_record = vector::borrow_mut(&mut item.ownership_history, h_len - 1);
                        if (last_record.to_timestamp == 0) {
                            last_record.to_timestamp = now;
                        };
                    };
                    vector::push_back(&mut item.ownership_history, OwnershipRecord {
                        owner: assigned_to,
                        from_timestamp: now,
                        to_timestamp: 0,
                        transfer_reason: std::string::utf8(b"ADMIN_ASSIGNMENT"),
                    });
                };

                item.current_owner = assigned_to;
                item.status = STATUS_ACTIVE;
                item.updated_at = now;
                found = true;

                event::emit(AssetAssigned {
                    asset_id,
                    assigned_to,
                    assigned_by: caller_addr,
                    assigned_at: now,
                });
                break;
            };
            i = i + 1;
        };

        assert!(found, E_ASSET_NOT_FOUND);
    }

    /// Transfer asset ownership (Current owner, Admin, or Manager)
    public entry fun transfer_asset(
        account: &signer,
        asset_id: String,
        to_owner: address,
        reason: String
    ) acquires AssetStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;
        let found = false;
        let now = timestamp::now_seconds();

        while (i < len) {
            let item = vector::borrow_mut(&mut store.assets, i);
            if (item.asset_id == asset_id) {
                assert!(item.status != STATUS_REVOKED, E_ASSET_REVOKED);
                // Smart contract independent authorization check:
                // Caller must be either current owner, or an authorized Admin / Manager
                let is_authorized = caller_addr == item.current_owner || access::is_manager_or_admin(caller_addr);
                assert!(is_authorized, E_NOT_AUTHORIZED);

                let from_owner = item.current_owner;

                // Close existing ownership window
                let h_len = vector::length(&item.ownership_history);
                if (h_len > 0) {
                    let last_record = vector::borrow_mut(&mut item.ownership_history, h_len - 1);
                    if (last_record.to_timestamp == 0) {
                        last_record.to_timestamp = now;
                    };
                };

                // Add new ownership entry
                vector::push_back(&mut item.ownership_history, OwnershipRecord {
                    owner: to_owner,
                    from_timestamp: now,
                    to_timestamp: 0,
                    transfer_reason: reason,
                });

                item.current_owner = to_owner;
                item.status = STATUS_ACTIVE;
                item.updated_at = now;
                found = true;

                event::emit(AssetTransferred {
                    asset_id,
                    from_owner,
                    to_owner,
                    transferred_by: caller_addr,
                    reason,
                    transferred_at: now,
                });
                break;
            };
            i = i + 1;
        };

        assert!(found, E_ASSET_NOT_FOUND);
    }

    /// Revoke an asset (Admin or Manager only)
    public entry fun revoke_asset(
        account: &signer,
        asset_id: String,
        reason: String
    ) acquires AssetStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);
        assert!(access::is_manager_or_admin(caller_addr), E_NOT_AUTHORIZED);

        let store = borrow_global_mut<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;
        let found = false;
        let now = timestamp::now_seconds();

        while (i < len) {
            let item = vector::borrow_mut(&mut store.assets, i);
            if (item.asset_id == asset_id) {
                assert!(item.status != STATUS_REVOKED, E_ASSET_REVOKED);

                // Close current ownership interval
                let h_len = vector::length(&item.ownership_history);
                if (h_len > 0) {
                    let last_record = vector::borrow_mut(&mut item.ownership_history, h_len - 1);
                    if (last_record.to_timestamp == 0) {
                        last_record.to_timestamp = now;
                    };
                };

                item.status = STATUS_REVOKED;
                item.updated_at = now;
                found = true;

                event::emit(AssetRevoked {
                    asset_id,
                    revoked_by: caller_addr,
                    reason,
                    revoked_at: now,
                });
                break;
            };
            i = i + 1;
        };

        assert!(found, E_ASSET_NOT_FOUND);
    }

    #[view]
    public fun get_asset(asset_id: String): (String, String, String, address, u8, u64, u64) acquires AssetStore {
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;

        while (i < len) {
            let item = vector::borrow(&store.assets, i);
            if (item.asset_id == asset_id) {
                return (
                    item.name,
                    item.asset_type,
                    item.metadata_hash,
                    item.current_owner,
                    item.status,
                    item.minted_at,
                    item.updated_at
                )
            };
            i = i + 1;
        };

        abort E_ASSET_NOT_FOUND
    }

    #[view]
    public fun get_ownership_history_count(asset_id: String): u64 acquires AssetStore {
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;

        while (i < len) {
            let item = vector::borrow(&store.assets, i);
            if (item.asset_id == asset_id) {
                return vector::length(&item.ownership_history)
            };
            i = i + 1;
        };

        abort E_ASSET_NOT_FOUND
    }

    #[view]
    public fun get_ownership_record(asset_id: String, index: u64): (address, u64, u64, String) acquires AssetStore {
        let store_addr = @authentra;
        assert!(exists<AssetStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global<AssetStore>(store_addr);
        let len = vector::length(&store.assets);
        let i = 0;

        while (i < len) {
            let item = vector::borrow(&store.assets, i);
            if (item.asset_id == asset_id) {
                let record = vector::borrow(&item.ownership_history, index);
                return (
                    record.owner,
                    record.from_timestamp,
                    record.to_timestamp,
                    record.transfer_reason
                )
            };
            i = i + 1;
        };

        abort E_ASSET_NOT_FOUND
    }
}
