use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, Symbol};

#[test]
fn test_escrow_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PayarMoveEscrow);
    let client = PayarMoveEscrowClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let renter = Address::generate(&env);
    let host = Address::generate(&env);

    // Initialize contract
    client.initialize(&admin, &treasury);

    // Deploy mock token (USDC)
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::Client::new(&env, &token_contract);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

    // Mint USDC to renter (150 rent + 100 deposit = 250 USDC with 7 decimals)
    let rental_amount: i128 = 150_0000000;
    let deposit_amount: i128 = 100_0000000;
    let total_due = rental_amount + deposit_amount;
    token_admin_client.mint(&renter, &total_due);

    assert_eq!(token_client.balance(&renter), total_due);

    // Create Agreement
    let agreement_id = Symbol::new(&env, "RENT001");
    client.create_agreement(
        &agreement_id,
        &renter,
        &host,
        &token_contract,
        &rental_amount,
        &deposit_amount,
        &1000, // 10%
    );

    let agreement = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agreement.status, AgreementStatus::Created);

    // Renter deposits funds
    client.deposit_funds(&agreement_id);

    assert_eq!(token_client.balance(&renter), 0);
    assert_eq!(token_client.balance(&contract_id), total_due);

    let agreement_funded = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agreement_funded.status, AgreementStatus::Funded);

    // Complete and disburse:
    // Host gets 150 * 90% = 135 USDC
    // Treasury gets 150 * 10% = 15 USDC
    // Renter gets 100 USDC deposit refund
    client.complete_and_disburse(&agreement_id);

    let expected_host_payout = 135_0000000;
    let expected_treasury = 15_0000000;
    let expected_deposit_refund = 100_0000000;

    assert_eq!(token_client.balance(&host), expected_host_payout);
    assert_eq!(token_client.balance(&treasury), expected_treasury);
    assert_eq!(token_client.balance(&renter), expected_deposit_refund);
    assert_eq!(token_client.balance(&contract_id), 0);

    let agreement_completed = client.get_agreement(&agreement_id).unwrap();
    assert_eq!(agreement_completed.status, AgreementStatus::Completed);
}
