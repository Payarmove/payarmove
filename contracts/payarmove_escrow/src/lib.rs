#![no_std]

mod storage;
mod types;

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contracterror, contractimpl, panic_with_error, symbol_short, token, Address, Env,
    Symbol,
};

pub use types::{AgreementStatus, RentalAgreement};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    AgreementAlreadyExists = 3,
    AgreementNotFound = 4,
    InvalidStatus = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
    DisputeTotalMismatch = 8,
}

#[contract]
pub struct PayarMoveEscrow;

#[contractimpl]
impl PayarMoveEscrow {
    /// Initialize the contract with an admin and treasury address.
    pub fn initialize(env: Env, admin: Address, treasury: Address) {
        if storage::has_admin(&env) {
            panic_with_error!(&env, ContractError::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::set_treasury(&env, &treasury);
    }

    /// Create a new rental agreement on-chain.
    pub fn create_agreement(
        env: Env,
        agreement_id: Symbol,
        renter: Address,
        host: Address,
        token: Address,
        rental_amount: i128,
        deposit_amount: i128,
        platform_fee_bps: u32,
    ) {
        if !storage::has_admin(&env) {
            panic_with_error!(&env, ContractError::NotInitialized);
        }

        let admin = storage::get_admin(&env);
        admin.require_auth();

        if rental_amount <= 0 || deposit_amount < 0 {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }

        if storage::get_agreement(&env, &agreement_id).is_some() {
            panic_with_error!(&env, ContractError::AgreementAlreadyExists);
        }

        let agreement = RentalAgreement {
            agreement_id: agreement_id.clone(),
            renter,
            host,
            token,
            rental_amount,
            deposit_amount,
            platform_fee_bps,
            status: AgreementStatus::Created,
            created_ledger: env.ledger().sequence(),
        };

        storage::set_agreement(&env, &agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("created"), agreement_id),
            (agreement.rental_amount, agreement.deposit_amount),
        );
    }

    /// Renter deposits the required USDC into the escrow contract.
    pub fn deposit_funds(env: Env, agreement_id: Symbol) {
        let mut agreement = match storage::get_agreement(&env, &agreement_id) {
            Some(a) => a,
            None => panic_with_error!(&env, ContractError::AgreementNotFound),
        };

        if agreement.status != AgreementStatus::Created {
            panic_with_error!(&env, ContractError::InvalidStatus);
        }

        agreement.renter.require_auth();

        let total_due = agreement.rental_amount + agreement.deposit_amount;
        let token_client = token::Client::new(&env, &agreement.token);

        // Transfer funds from renter to this contract
        token_client.transfer(
            &agreement.renter,
            &env.current_contract_address(),
            &total_due,
        );

        agreement.status = AgreementStatus::Funded;
        storage::set_agreement(&env, &agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("funded"), agreement_id),
            total_due,
        );
    }

    /// Complete rental and release funds:
    /// - Host receives 90% of rental fee
    /// - Platform treasury receives 10% platform fee
    /// - Renter receives 100% of security deposit back
    pub fn complete_and_disburse(env: Env, agreement_id: Symbol) {
        let admin = storage::get_admin(&env);
        admin.require_auth();

        let mut agreement = match storage::get_agreement(&env, &agreement_id) {
            Some(a) => a,
            None => panic_with_error!(&env, ContractError::AgreementNotFound),
        };

        if agreement.status != AgreementStatus::Funded {
            panic_with_error!(&env, ContractError::InvalidStatus);
        }

        let treasury = storage::get_treasury(&env);
        let token_client = token::Client::new(&env, &agreement.token);

        // Fee calculations
        let fee = (agreement.rental_amount * agreement.platform_fee_bps as i128) / 10000;
        let host_payout = agreement.rental_amount - fee;

        // Disburse host earnings
        if host_payout > 0 {
            token_client.transfer(&env.current_contract_address(), &agreement.host, &host_payout);
        }

        // Disburse platform fee
        if fee > 0 {
            token_client.transfer(&env.current_contract_address(), &treasury, &fee);
        }

        // Refund full deposit to renter
        if agreement.deposit_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &agreement.renter,
                &agreement.deposit_amount,
            );
        }

        agreement.status = AgreementStatus::Completed;
        storage::set_agreement(&env, &agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("settled"), agreement_id),
            (host_payout, fee, agreement.deposit_amount),
        );
    }

    /// Resolve deposit dispute between host and renter with partial deduction.
    pub fn resolve_dispute(
        env: Env,
        agreement_id: Symbol,
        host_damage_award: i128,
        renter_deposit_refund: i128,
    ) {
        let admin = storage::get_admin(&env);
        admin.require_auth();

        let mut agreement = match storage::get_agreement(&env, &agreement_id) {
            Some(a) => a,
            None => panic_with_error!(&env, ContractError::AgreementNotFound),
        };

        if agreement.status != AgreementStatus::Funded {
            panic_with_error!(&env, ContractError::InvalidStatus);
        }

        if host_damage_award + renter_deposit_refund != agreement.deposit_amount {
            panic_with_error!(&env, ContractError::DisputeTotalMismatch);
        }

        let treasury = storage::get_treasury(&env);
        let token_client = token::Client::new(&env, &agreement.token);

        let fee = (agreement.rental_amount * agreement.platform_fee_bps as i128) / 10000;
        let host_payout = (agreement.rental_amount - fee) + host_damage_award;

        // Transfer payout to host (rental share + damage claim)
        if host_payout > 0 {
            token_client.transfer(&env.current_contract_address(), &agreement.host, &host_payout);
        }

        // Transfer platform fee
        if fee > 0 {
            token_client.transfer(&env.current_contract_address(), &treasury, &fee);
        }

        // Refund remaining deposit to renter
        if renter_deposit_refund > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &agreement.renter,
                &renter_deposit_refund,
            );
        }

        agreement.status = AgreementStatus::Disputed;
        storage::set_agreement(&env, &agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("disputed"), agreement_id),
            (host_damage_award, renter_deposit_refund),
        );
    }

    /// Cancel rental prior to commencement and return 100% of funds to renter.
    pub fn cancel_and_refund(env: Env, agreement_id: Symbol) {
        let admin = storage::get_admin(&env);
        admin.require_auth();

        let mut agreement = match storage::get_agreement(&env, &agreement_id) {
            Some(a) => a,
            None => panic_with_error!(&env, ContractError::AgreementNotFound),
        };

        if agreement.status == AgreementStatus::Funded {
            let total_refund = agreement.rental_amount + agreement.deposit_amount;
            let token_client = token::Client::new(&env, &agreement.token);
            token_client.transfer(
                &env.current_contract_address(),
                &agreement.renter,
                &total_refund,
            );
        } else if agreement.status != AgreementStatus::Created {
            panic_with_error!(&env, ContractError::InvalidStatus);
        }

        agreement.status = AgreementStatus::Cancelled;
        storage::set_agreement(&env, &agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("canceled"), agreement_id),
            (),
        );
    }

    /// Read agreement state
    pub fn get_agreement(env: Env, agreement_id: Symbol) -> Option<RentalAgreement> {
        storage::get_agreement(&env, &agreement_id)
    }
}
