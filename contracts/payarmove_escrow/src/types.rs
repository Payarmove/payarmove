use soroban_sdk::{contracttype, Address, Symbol};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AgreementStatus {
    Created = 0,
    Funded = 1,
    Completed = 2,
    Disputed = 3,
    Cancelled = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RentalAgreement {
    pub agreement_id: Symbol,
    pub renter: Address,
    pub host: Address,
    pub token: Address,
    pub rental_amount: i128,
    pub deposit_amount: i128,
    pub platform_fee_bps: u32, // e.g., 1000 = 10.00%
    pub status: AgreementStatus,
    pub created_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Treasury,
    Agreement(Symbol),
}
