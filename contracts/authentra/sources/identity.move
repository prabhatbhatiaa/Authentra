module authentra::identity {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // Error Codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_IDENTITY_ALREADY_EXISTS: u64 = 4;
    const E_IDENTITY_NOT_FOUND: u64 = 5;
    const E_INVALID_STATUS: u64 = 6;

    // Identity Status Constants
    const STATUS_PENDING: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_SUSPENDED: u8 = 2;
    const STATUS_REVOKED: u8 = 3;

    struct IdentityRecord has store, copy, drop {
        did: String,
        wallet_address: address,
        status: u8,
        is_verified: bool,
        created_at: u64,
        updated_at: u64,
    }

    struct IdentityStore has key {
        admin: address,
        records: vector<IdentityRecord>,
    }

    // Events
    #[event]
    struct IdentityCreated has drop, store {
        did: String,
        wallet_address: address,
        status: u8,
        is_verified: bool,
        created_at: u64,
    }

    #[event]
    struct IdentityStatusUpdated has drop, store {
        did: String,
        wallet_address: address,
        old_status: u8,
        new_status: u8,
        updated_at: u64,
    }

    #[event]
    struct IdentityVerificationUpdated has drop, store {
        did: String,
        wallet_address: address,
        is_verified: bool,
        updated_at: u64,
    }

    /// Initialize the Identity module store at deployer address
    public entry fun initialize(account: &signer) {
        let admin_addr = signer::address_of(account);
        assert!(!exists<IdentityStore>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(account, IdentityStore {
            admin: admin_addr,
            records: vector::empty<IdentityRecord>(),
        });
    }

    /// Register a new digital identity on-chain
    public entry fun register_identity(
        account: &signer,
        target_wallet: address,
        did: String,
        is_verified: bool
    ) acquires IdentityStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<IdentityStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<IdentityStore>(store_addr);
        // Authorization: Caller must be admin or the user themselves registering their identity
        assert!(caller_addr == store.admin || caller_addr == target_wallet, E_NOT_AUTHORIZED);

        // Ensure DID is not already registered
        let len = vector::length(&store.records);
        let i = 0;
        while (i < len) {
            let item = vector::borrow(&store.records, i);
            assert!(item.wallet_address != target_wallet, E_IDENTITY_ALREADY_EXISTS);
            i = i + 1;
        };

        let now = timestamp::now_seconds();
        let record = IdentityRecord {
            did,
            wallet_address: target_wallet,
            status: STATUS_ACTIVE,
            is_verified,
            created_at: now,
            updated_at: now,
        };

        vector::push_back(&mut store.records, record);

        event::emit(IdentityCreated {
            did,
            wallet_address: target_wallet,
            status: STATUS_ACTIVE,
            is_verified,
            created_at: now,
        });
    }

    /// Update an identity's status (Admin only)
    public entry fun update_status(
        account: &signer,
        target_wallet: address,
        new_status: u8
    ) acquires IdentityStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<IdentityStore>(store_addr), E_NOT_INITIALIZED);
        assert!(new_status <= STATUS_REVOKED, E_INVALID_STATUS);

        let store = borrow_global_mut<IdentityStore>(store_addr);
        assert!(caller_addr == store.admin, E_NOT_AUTHORIZED);

        let len = vector::length(&store.records);
        let i = 0;
        let found = false;
        let now = timestamp::now_seconds();

        while (i < len) {
            let item = vector::borrow_mut(&mut store.records, i);
            if (item.wallet_address == target_wallet) {
                let old_status = item.status;
                item.status = new_status;
                item.updated_at = now;
                found = true;

                event::emit(IdentityStatusUpdated {
                    did: item.did,
                    wallet_address: target_wallet,
                    old_status,
                    new_status,
                    updated_at: now,
                });
                break;
            };
            i = i + 1;
        };

        assert!(found, E_IDENTITY_NOT_FOUND);
    }

    /// Update an identity's verification status (Admin only)
    public entry fun update_verification(
        account: &signer,
        target_wallet: address,
        is_verified: bool
    ) acquires IdentityStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<IdentityStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<IdentityStore>(store_addr);
        assert!(caller_addr == store.admin, E_NOT_AUTHORIZED);

        let len = vector::length(&store.records);
        let i = 0;
        let found = false;
        let now = timestamp::now_seconds();

        while (i < len) {
            let item = vector::borrow_mut(&mut store.records, i);
            if (item.wallet_address == target_wallet) {
                item.is_verified = is_verified;
                item.updated_at = now;
                found = true;

                event::emit(IdentityVerificationUpdated {
                    did: item.did,
                    wallet_address: target_wallet,
                    is_verified,
                    updated_at: now,
                });
                break;
            };
            i = i + 1;
        };

        assert!(found, E_IDENTITY_NOT_FOUND);
    }

    #[view]
    public fun get_identity(target_wallet: address): (String, address, u8, bool, u64, u64) acquires IdentityStore {
        let store_addr = @authentra;
        assert!(exists<IdentityStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global<IdentityStore>(store_addr);
        let len = vector::length(&store.records);
        let i = 0;

        while (i < len) {
            let item = vector::borrow(&store.records, i);
            if (item.wallet_address == target_wallet) {
                return (
                    item.did,
                    item.wallet_address,
                    item.status,
                    item.is_verified,
                    item.created_at,
                    item.updated_at
                )
            };
            i = i + 1;
        };

        abort E_IDENTITY_NOT_FOUND
    }

    #[view]
    public fun is_active_and_verified(target_wallet: address): bool acquires IdentityStore {
        let store_addr = @authentra;
        if (!exists<IdentityStore>(store_addr)) {
            return false
        };

        let store = borrow_global<IdentityStore>(store_addr);
        let len = vector::length(&store.records);
        let i = 0;

        while (i < len) {
            let item = vector::borrow(&store.records, i);
            if (item.wallet_address == target_wallet) {
                return item.status == STATUS_ACTIVE && item.is_verified
            };
            i = i + 1;
        };

        false
    }
}
