module authentra::access {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // Error Codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_ROLE_ALREADY_ASSIGNED: u64 = 4;
    const E_ROLE_NOT_ASSIGNED: u64 = 5;
    const E_CANNOT_SELF_MODIFY: u64 = 6;

    // Role definitions
    const ROLE_ADMIN: u8 = 1;
    const ROLE_MANAGER: u8 = 2;
    const ROLE_AUDITOR: u8 = 3;
    const ROLE_USER: u8 = 4;

    struct RoleAssignment has store, copy, drop {
        wallet_address: address,
        role_id: u8,
        role_name: String,
        assigned_by: address,
        assigned_at: u64,
    }

    struct AccessStore has key {
        admin: address,
        assignments: vector<RoleAssignment>,
    }

    // Events
    #[event]
    struct RoleAssigned has drop, store {
        wallet_address: address,
        role_id: u8,
        role_name: String,
        assigned_by: address,
        assigned_at: u64,
    }

    #[event]
    struct RoleRevoked has drop, store {
        wallet_address: address,
        role_id: u8,
        revoked_by: address,
        revoked_at: u64,
    }

    /// Initialize the Access Control store
    public entry fun initialize(account: &signer) {
        let admin_addr = signer::address_of(account);
        assert!(!exists<AccessStore>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(account, AccessStore {
            admin: admin_addr,
            assignments: vector::empty<RoleAssignment>(),
        });
    }

    /// Assign a role to a wallet address (Admin only, with self-privilege modification prohibition)
    public entry fun assign_role(
        account: &signer,
        target_wallet: address,
        role_id: u8,
        role_name: String
    ) acquires AccessStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AccessStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<AccessStore>(store_addr);
        // Authorization: Caller must be the store admin
        assert!(caller_addr == store.admin, E_NOT_AUTHORIZED);
        // Self-privilege modification prohibition
        assert!(caller_addr != target_wallet, E_CANNOT_SELF_MODIFY);

        // Check if role is already assigned
        let len = vector::length(&store.assignments);
        let i = 0;
        while (i < len) {
            let item = vector::borrow(&store.assignments, i);
            if (item.wallet_address == target_wallet && item.role_id == role_id) {
                abort E_ROLE_ALREADY_ASSIGNED
            };
            i = i + 1;
        };

        let now = timestamp::now_seconds();
        let assignment = RoleAssignment {
            wallet_address: target_wallet,
            role_id,
            role_name,
            assigned_by: caller_addr,
            assigned_at: now,
        };

        vector::push_back(&mut store.assignments, assignment);

        event::emit(RoleAssigned {
            wallet_address: target_wallet,
            role_id,
            role_name,
            assigned_by: caller_addr,
            assigned_at: now,
        });
    }

    /// Revoke a role from a wallet address (Admin only, with self-privilege modification prohibition)
    public entry fun revoke_role(
        account: &signer,
        target_wallet: address,
        role_id: u8
    ) acquires AccessStore {
        let caller_addr = signer::address_of(account);
        let store_addr = @authentra;
        assert!(exists<AccessStore>(store_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<AccessStore>(store_addr);
        assert!(caller_addr == store.admin, E_NOT_AUTHORIZED);
        assert!(caller_addr != target_wallet, E_CANNOT_SELF_MODIFY);

        let len = vector::length(&store.assignments);
        let i = 0;
        let found = false;
        let target_idx = 0;

        while (i < len) {
            let item = vector::borrow(&store.assignments, i);
            if (item.wallet_address == target_wallet && item.role_id == role_id) {
                found = true;
                target_idx = i;
                break;
            };
            i = i + 1;
        };

        assert!(found, E_ROLE_NOT_ASSIGNED);

        vector::swap_remove(&mut store.assignments, target_idx);

        let now = timestamp::now_seconds();
        event::emit(RoleRevoked {
            wallet_address: target_wallet,
            role_id,
            revoked_by: caller_addr,
            revoked_at: now,
        });
    }

    #[view]
    public fun has_role(target_wallet: address, role_id: u8): bool acquires AccessStore {
        let store_addr = @authentra;
        if (!exists<AccessStore>(store_addr)) {
            return false
        };

        let store = borrow_global<AccessStore>(store_addr);
        // Admin root address always has admin role implicitly
        if (target_wallet == store.admin && role_id == ROLE_ADMIN) {
            return true
        };

        let len = vector::length(&store.assignments);
        let i = 0;
        while (i < len) {
            let item = vector::borrow(&store.assignments, i);
            if (item.wallet_address == target_wallet && item.role_id == role_id) {
                return true
            };
            i = i + 1;
        };

        false
    }

    #[view]
    public fun is_admin(caller: address): bool acquires AccessStore {
        let store_addr = @authentra;
        if (!exists<AccessStore>(store_addr)) {
            return caller == store_addr
        };

        let store = borrow_global<AccessStore>(store_addr);
        if (caller == store.admin) {
            return true
        };

        has_role(caller, ROLE_ADMIN)
    }

    #[view]
    public fun is_manager_or_admin(caller: address): bool acquires AccessStore {
        if (is_admin(caller)) {
            return true
        };

        has_role(caller, ROLE_MANAGER)
    }
}
