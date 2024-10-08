use num_traits::FromPrimitive;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    instruction::{Instruction},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::{PrintProgramError, ProgramError},
    program::invoke,
    pubkey::Pubkey,
    decode_error::DecodeError,
    system_instruction,
};

use spl_token_2022::{
    error::TokenError,
    instruction::sync_native,
};

use std::{error::Error};

entrypoint!(process_instruction);

use spl_associated_token_account::{instruction::create_associated_token_account};

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    
    let exists_flag = _instruction_data[0]; // 1: account does not exist, 0: account exists
    msg!("exists_flag: {}", exists_flag);

    let accounts_iter = &mut accounts.iter();
    
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let associated_token_program = next_account_info(accounts_iter)?;
    let owner_pubkey = next_account_info(accounts_iter)?;
    let associated_token_address = next_account_info(accounts_iter)?;
    let wsol_mint_pubkey = next_account_info(accounts_iter)?;

    if exists_flag == 0 {
        msg!("create associated Token account...");

        let create_account_ix = create_associated_token_account(owner_pubkey.key, owner_pubkey.key, wsol_mint_pubkey.key, token_program.key);

        invoke(
            &create_account_ix,
            &[owner_pubkey.clone(), associated_token_address.clone(), owner_pubkey.clone(), wsol_mint_pubkey.clone(), system_program.clone(), token_program.clone(), associated_token_program.clone()],
        )?;
        msg!("create associated Token account completed");
    }

    let amount: u64 = 1_000_000_000;
    msg!("Transfer amount: {}", amount);

    let transfer_ix = system_instruction::transfer(owner_pubkey.key, associated_token_address.key, amount);

    invoke(
        &transfer_ix,
        &[
            owner_pubkey.clone(),
            associated_token_address.clone(),
            system_program.clone(),
        ],
    )?;
    msg!("Transfer completed");

    let sync_native_ix = sync_native(
        &token_program.key,
        &associated_token_address.key,
    )?;

    invoke(
        &sync_native_ix,
        &[
            associated_token_address.clone(),
            token_program.clone(),
            system_program.clone(),
        ],
    )?;
    msg!("Sync native completed");

    Ok(())
}