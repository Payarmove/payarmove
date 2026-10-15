use crate::types::{DataKey, RentalAgreement};
use soroban_sdk::{Address, Env, Symbol};

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_treasury(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Treasury).unwrap()
}

pub fn set_treasury(env: &Env, treasury: &Address) {
    env.storage().instance().set(&DataKey::Treasury, treasury);
}

pub fn get_agreement(env: &Env, id: &Symbol) -> Option<RentalAgreement> {
    env.storage().persistent().get(&DataKey::Agreement(id.clone()))
}

pub fn set_agreement(env: &Env, id: &Symbol, agreement: &RentalAgreement) {
    env.storage()
        .persistent()
        .set(&DataKey::Agreement(id.clone()), agreement);
}
