#[test_only]
module authentra::authentra_tests {
    use std::signer;
    use std::string;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use authentra::identity;
    use authentra::access;
    use authentra::asset;

    #[test(framework = @0x1, admin = @authentra, user1 = @0x100, user2 = @0x200)]
    fun test_full_lifecycle(framework: &signer, admin: &signer, user1: &signer, user2: &signer) {
        // Initialize framework timestamp for test
        timestamp::set_time_has_started_for_testing(framework);
        timestamp::update_global_time_for_test_secs(1700000000);

        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(user1));
        account::create_account_for_test(signer::address_of(user2));

        let admin_addr = signer::address_of(admin);
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        // 1. Initialize Stores
        identity::initialize(admin);
        access::initialize(admin);
        asset::initialize(admin);

        // 2. Identity Registration & Verification
        let did1 = string::utf8(b"did:authentra:aptos:0x100");
        identity::register_identity(admin, user1_addr, did1, true);
        assert!(identity::is_active_and_verified(user1_addr), 101);

        // 3. RBAC Role Assignment
        access::assign_role(admin, user1_addr, 2, string::utf8(b"MANAGER"));
        assert!(access::has_role(user1_addr, 2), 102);
        assert!(access::is_manager_or_admin(user1_addr), 103);

        // 4. Asset Minting by Manager
        let asset_id = string::utf8(b"AST-TEST-001");
        asset::mint_asset(
            user1,
            asset_id,
            string::utf8(b"Quantum Security Key"),
            string::utf8(b"SECURITY_TOKEN"),
            string::utf8(b"hash-1234567890abcdef"),
            user1_addr
        );

        let (name, asset_type, _, current_owner, status, _, _) = asset::get_asset(asset_id);
        assert!(name == string::utf8(b"Quantum Security Key"), 104);
        assert!(asset_type == string::utf8(b"SECURITY_TOKEN"), 105);
        assert!(current_owner == user1_addr, 106);
        assert!(status == 1, 107); // STATUS_MINTED

        // 5. Transfer Asset
        timestamp::update_global_time_for_test_secs(1700000100);
        asset::transfer_asset(user1, asset_id, user2_addr, string::utf8(b"Primary Custody Transfer"));

        let (_, _, _, new_owner, new_status, _, _) = asset::get_asset(asset_id);
        assert!(new_owner == user2_addr, 108);
        assert!(new_status == 2, 109); // STATUS_ACTIVE

        // Check ownership history
        let history_count = asset::get_ownership_history_count(asset_id);
        assert!(history_count == 2, 110);

        let (h0_owner, _, h0_to, _) = asset::get_ownership_record(asset_id, 0);
        assert!(h0_owner == user1_addr, 111);
        assert!(h0_to == 1700000100, 112);

        let (h1_owner, h1_from, h1_to, _) = asset::get_ownership_record(asset_id, 1);
        assert!(h1_owner == user2_addr, 113);
        assert!(h1_from == 1700000100, 114);
        assert!(h1_to == 0, 115); // Currently active

        // 6. Revocation
        asset::revoke_asset(admin, asset_id, string::utf8(b"Decommissioning Token"));
        let (_, _, _, _, revoked_status, _, _) = asset::get_asset(asset_id);
        assert!(revoked_status == 3, 116); // STATUS_REVOKED
    }
}
