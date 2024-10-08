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
};

use spl_token_2022::{
    error::TokenError,
    instruction::{close_account},
};

use std::{error::Error};

use spl_associated_token_account::{instruction::create_associated_token_account};

entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    
    let exists_flag = _instruction_data[0]; //1 account no exists, 0 account exist

    let accounts_iter = &mut accounts.iter();
    
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let associated_token_program = next_account_info(accounts_iter)?;
    let owner_pubkey = next_account_info(accounts_iter)?;
    let associated_token_address = next_account_info(accounts_iter)?;
    let wsol_mint_pubkey = next_account_info(accounts_iter)?;

    if exists_flag == 0 {
        msg!("Creating associated token account...");

        let ix_create_account = create_associated_token_account(
            owner_pubkey.key, 
            owner_pubkey.key, 
            wsol_mint_pubkey.key, 
            token_program.key
        );

        invoke(
            &ix_create_account,
            &[
                owner_pubkey.clone(), 
                associated_token_address.clone(), 
                owner_pubkey.clone(), 
                wsol_mint_pubkey.clone(), 
                system_program.clone(), 
                token_program.clone(), 
                associated_token_program.clone()
            ],
        )?;
        msg!("Associated token account created.");
    }
    
    msg!("Closing wrapped SOL account...");

    let close_ix = close_account(
        token_program.key,
        associated_token_address.key,
        owner_pubkey.key,
        owner_pubkey.key,
        &[],
    )?;
    
    invoke(
        &close_ix,
        &[
            associated_token_address.clone(),
            owner_pubkey.clone(),
            token_program.clone(),
        ],
    )?;

    Ok(())
}