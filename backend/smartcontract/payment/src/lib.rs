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
};

use std::{error::Error};
use std::str::FromStr;

entrypoint!(process_instruction);

use spl_associated_token_account::{instruction::create_associated_token_account};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    
    let num_accounts = _instruction_data[0];
    let _num_purchase_pics = _instruction_data[1];

    let accounts_iter = &mut accounts.iter();
    
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let associated_token_program = next_account_info(accounts_iter)?;
    let mint_pubkey = next_account_info(accounts_iter)?;

    //00:buyer account
    let pubkey_00_account_info = next_account_info(accounts_iter)?;
    let pubkey_00_associated_token_account_info = next_account_info(accounts_iter)?;
    //01:data2tx account
    let pubkey_01_account_info = next_account_info(accounts_iter)?;
    let pubkey_01_associated_token_account_info = next_account_info(accounts_iter)?;

    //check data2tx account
    let expected_pubkey_str = "24MQhhEFtRtU4LTVY8PcdLd2p6SjL9NgJR2MWpMbMa8F";
    let expected_pubkey = match Pubkey::from_str(expected_pubkey_str) {
        Ok(pubkey) => pubkey,
        Err(_) => return Err(ProgramError::InvalidInstructionData),
    };

    if pubkey_01_account_info.key != &expected_pubkey {
        return Err(ProgramError::Custom(1));
    }
    
    //check data2tx associated token account(wSOL)
    let expected_associated_pubkey_str = "Hp2ibCaKjb1ML6Xd2DLwkdEvQhRD2Vzd3ZXgc3oF9oxT";
    let expected_associated_pubkey = match Pubkey::from_str(expected_associated_pubkey_str) {
        Ok(pubkey) => pubkey,
        Err(_) => return Err(ProgramError::InvalidInstructionData),
    };

    if pubkey_01_associated_token_account_info.key != &expected_associated_pubkey {
        return Err(ProgramError::Custom(1));
    }

    let mut account_info_array: Vec<&AccountInfo> = Vec::new();
    let mut associated_account_info_array: Vec<&AccountInfo> = Vec::new();

    for _n in 2..num_accounts {
        let account_info = next_account_info(accounts_iter)?;
        account_info_array.push(account_info);
        let associated_account_info = next_account_info(accounts_iter)?;
        associated_account_info_array.push(associated_account_info);
    }
    
    //output log
    for n in 2..num_accounts {
        let flag = _instruction_data[3 + n as usize];
        let startidx = 3 + num_accounts + 8 * (n - 2);
        let endidx = 3 + num_accounts + 8 * (n - 1);
        let filename = &_instruction_data[startidx as usize..endidx as usize];
        if filename.len() == 8 {
            let array: [u8; 8] = [
                filename[0],
                filename[1],
                filename[2],
                filename[3],
                filename[4],
                filename[5],
                filename[6],
                filename[7],
            ];
            let number = u64::from_le_bytes(array);
            let pubkey_option = account_info_array.get(n as usize - 2);
            if let Some(pubkey) = pubkey_option {
                let pubkey_str = (*pubkey.key).to_string();
                let top_10_pubkey = &pubkey_str[..10];
                if flag == 1 {
                    let result = format!("Demo: buy image:{}{} from {}   (0 wSOL, create associated account)", number, top_10_pubkey, pubkey_str);
                    msg!("{}", result);
                }else{
                    let result = format!("Demo: buy image:{}{} from {}   (0 wSOL)", number, top_10_pubkey, pubkey_str);
                    msg!("{}", result);
                }
            } else {
                msg!("Invalid pubkey");
            }
        } else {
            msg!("Invalid length");
        }
    }

    //transfer token
    for n in 2..num_accounts{
        let flag = _instruction_data[3 + n as usize];

        let (pda, bump_seed) = Pubkey::find_program_address(
            &[pubkey_00_account_info.key.as_ref()],
            program_id
        );

        let authority_signature_seeds = [&pubkey_00_account_info.key.as_ref()[..], &[bump_seed]];
        let signers = &[&authority_signature_seeds[..]];

        let mut amount_seller = 0; // 21_000_000 -> 0 for Demo
        let amount_platform = 0; // 9_000_000 -> 0 for Demo
        let decimals = 9;
        
        let mut pubkey_02_account_info = pubkey_00_account_info;
        let mut pubkey_02_associated_token_account_info = pubkey_00_associated_token_account_info;

        let account_info_option = account_info_array.get(n as usize - 2);
        if let Some(account_info) = account_info_option {
            pubkey_02_account_info = account_info;
        } else {
            msg!("Invalid account_info");
        }
        let associated_account_info_option = associated_account_info_array.get(n as usize - 2);
        if let Some(associated_account_info) = associated_account_info_option {
            pubkey_02_associated_token_account_info = associated_account_info;
        } else {
            msg!("Invalid associated_account_info");
        }

        // Check if the wSOL account for the sender (pubkey_00) exists, and create it if it doesn't
        let create_account_ix = create_associated_token_account(
            pubkey_00_account_info.key,
            pubkey_00_account_info.key,
            mint_pubkey.key,
            token_program.key,
        );

        // Check for the existence of the Associated Token Account and create it if necessary
        if pubkey_00_associated_token_account_info.lamports() == 0 {
            msg!("Creating associated token account for the sender...");
            invoke(
                &create_account_ix,
                &[
                    pubkey_00_account_info.clone(),
                    pubkey_00_associated_token_account_info.clone(),
                    mint_pubkey.clone(),
                    system_program.clone(),
                    token_program.clone(),
                    associated_token_program.clone(),
                ]
            )?;
        }

        // The buyer transfers the payment to the seller
        let seller_ix = spl_token_2022::instruction::transfer_checked(
            token_program.key,
            pubkey_00_associated_token_account_info.key,
            mint_pubkey.key,
            pubkey_02_associated_token_account_info.key,
            pubkey_00_account_info.key,
            &[],
            amount_seller,
            decimals,
        )?;

        invoke(
            &seller_ix,
            &[pubkey_00_associated_token_account_info.clone(), mint_pubkey.clone(), pubkey_02_associated_token_account_info.clone(), pubkey_00_account_info.clone(), token_program.clone()],
        )?;

        // The buyer transfers the fee to data2tx
        let platform_ix = spl_token_2022::instruction::transfer_checked(
            token_program.key,
            pubkey_00_associated_token_account_info.key,
            mint_pubkey.key,
            pubkey_01_associated_token_account_info.key,
            pubkey_00_account_info.key,
            &[],
            amount_platform,
            decimals,
        )?;

        invoke(
            &platform_ix,
            &[pubkey_00_associated_token_account_info.clone(), mint_pubkey.clone(), pubkey_01_associated_token_account_info.clone(), pubkey_00_account_info.clone(), token_program.clone()],
        )?;
    }
    
    Ok(())
}