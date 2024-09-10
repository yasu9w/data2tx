use borsh::{BorshDeserialize, BorshSerialize};

use num_traits::FromPrimitive;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    instruction::{Instruction},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::{PrintProgramError, ProgramError},
    program::invoke_signed,
    pubkey::Pubkey,
    decode_error::DecodeError,
};

use spl_token_2022::{
    error::TokenError,
};

use std::{error::Error};
use std::str::FromStr;


/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

entrypoint!(process_instruction);

use spl_associated_token_account::{instruction::create_associated_token_account};

fn invoke_signed_wrapper<T>(
    instruction: &Instruction,
    account_infos: &[AccountInfo],
    signers_seeds: &[&[&[u8]]],
) -> Result<(), ProgramError>
where
    T: 'static + PrintProgramError + DecodeError<T> + FromPrimitive + Error,
{
    invoke_signed(instruction, account_infos, signers_seeds).map_err(|err| {
        err.print::<T>();
        err
    })
}

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    
    let numAccounts = _instruction_data[0];
    let numPurchasePics = _instruction_data[1];
    let bumpPubkey = _instruction_data[2];

    let accounts_iter = &mut accounts.iter();
    
    let systemProgram = next_account_info(accounts_iter)?;
    let tokenProgram = next_account_info(accounts_iter)?;
    let associatedTokenProgram = next_account_info(accounts_iter)?;
    let mintPubkey = next_account_info(accounts_iter)?;

    let pubkey00AccountInfo = next_account_info(accounts_iter)?;
    let pubkey00AssociatedTokenAccountInfo = next_account_info(accounts_iter)?;
    let pubkey01AccountInfo = next_account_info(accounts_iter)?;
    let pubkey01AssociatedTokenAccountInfo = next_account_info(accounts_iter)?;

    let expected_pubkey_str = "24MQhhEFtRtU4LTVY8PcdLd2p6SjL9NgJR2MWpMbMa8F";
    let expected_pubkey = match Pubkey::from_str(expected_pubkey_str) {
        Ok(pubkey) => pubkey,
        Err(_) => return Err(ProgramError::InvalidInstructionData), // 任意のエラー値
    };
    //msg!("expected_pubkey {:?}",expected_pubkey);
    //msg!("pubkey01AccountInfo.key {:?}",pubkey01AccountInfo.key);

    if pubkey01AccountInfo.key != &expected_pubkey {
        return Err(ProgramError::Custom(1)); // 任意のエラー値
    }
    
    let expected_associated_pubkey_str = "9yhqGGuc7fVrE2zmZmC1cm4Lb43eHQD7QVpW3TnEJNUq";
    let expected_associated_pubkey = match Pubkey::from_str(expected_associated_pubkey_str) {
        Ok(pubkey) => pubkey,
        Err(_) => return Err(ProgramError::InvalidInstructionData), // 任意のエラー値
    };

    if pubkey01AssociatedTokenAccountInfo.key != &expected_associated_pubkey {
        return Err(ProgramError::Custom(1)); // 任意のエラー値
    }

    let mut account_info_array: Vec<&AccountInfo> = Vec::new();
    let mut associated_account_info_array: Vec<&AccountInfo> = Vec::new();

    for n in 2..numAccounts {
        let account_info = next_account_info(accounts_iter)?;
        account_info_array.push(account_info);
        let associated_account_info = next_account_info(accounts_iter)?;
        associated_account_info_array.push(associated_account_info);
    }
    
    for n in 2..numAccounts {
        let flag = _instruction_data[3 + n as usize];
        let startidx = 3 + numAccounts + 8 * (n - 2);
        let endidx = 3 + numAccounts + 8 * (n - 1);
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
            // Supposing pubkey is of type Pubkey
            let pubkey_option = account_info_array.get(n as usize - 2);
            if let Some(pubkey) = pubkey_option {
                let pubkey_str = (*pubkey.key).to_string();
                let top_10_pubkey = &pubkey_str[..10];
                if flag == 1 {
                    let result = format!("buy image:{}{} from {}   (2Token, create associated account)", number, top_10_pubkey, pubkey_str);
                    msg!("{}", result);
                }else{
                    let result = format!("buy image:{}{} from {}   (3Token)", number, top_10_pubkey, pubkey_str);
                    msg!("{}", result);
                }
            } else {
                msg!("Invalid pubkey");
            }
        } else {
            msg!("Invalid length");
        }
    }

    for n in 2..numAccounts{
        let flag = _instruction_data[3 + n as usize];

        let swap_bytes = pubkey00AccountInfo.key.to_bytes();
        let authority_signature_seeds = [&swap_bytes[..32], &[bumpPubkey]];
        let signers = &[&authority_signature_seeds[..]];

        let mut amountSeller = 2_100_000;
        let amountPlatform = 900_000;
        let decimals = 6;
        
        let mut pubkey02AccountInfo = pubkey00AccountInfo;
        let mut pubkey02AssociatedTokenAccountInfo = pubkey00AssociatedTokenAccountInfo;

        let account_info_option = account_info_array.get(n as usize - 2);
        if let Some(account_info) = account_info_option {
            pubkey02AccountInfo = account_info;
        } else {
            msg!("Invalid account_info");
        }
        let associated_account_info_option = associated_account_info_array.get(n as usize - 2);
        if let Some(associated_account_info) = associated_account_info_option {
            pubkey02AssociatedTokenAccountInfo = associated_account_info;
        } else {
            msg!("Invalid associated_account_info");
        }

        if flag == 1 {
            
            let ixCreateAccount = create_associated_token_account(pubkey00AccountInfo.key, pubkey02AccountInfo.key, mintPubkey.key, tokenProgram.key);

            invoke_signed_wrapper::<TokenError>(
                &ixCreateAccount,
                &[pubkey00AccountInfo.clone(), pubkey02AssociatedTokenAccountInfo.clone(), pubkey02AccountInfo.clone(), mintPubkey.clone(), systemProgram.clone(), tokenProgram.clone(), associatedTokenProgram.clone()],
                signers,
            );

            amountSeller = amountSeller - 1_000_000;

        }

        let ixSeller = spl_token_2022::instruction::transfer_checked(
            tokenProgram.key,
            pubkey00AssociatedTokenAccountInfo.key,
            mintPubkey.key,
            pubkey02AssociatedTokenAccountInfo.key,
            pubkey00AccountInfo.key,
            &[],
            amountSeller,
            decimals,
        )?;

        invoke_signed_wrapper::<TokenError>(
            &ixSeller,
            &[pubkey00AssociatedTokenAccountInfo.clone(), mintPubkey.clone(), pubkey02AssociatedTokenAccountInfo.clone(), pubkey00AccountInfo.clone(), tokenProgram.clone()],
            signers,
        );

        let ixPlatform = spl_token_2022::instruction::transfer_checked(
            tokenProgram.key,
            pubkey00AssociatedTokenAccountInfo.key,
            mintPubkey.key,
            pubkey01AssociatedTokenAccountInfo.key,
            pubkey00AccountInfo.key,
            &[],
            amountPlatform,
            decimals,
        )?;

        invoke_signed_wrapper::<TokenError>(
            &ixPlatform,
            &[pubkey00AssociatedTokenAccountInfo.clone(), mintPubkey.clone(), pubkey01AssociatedTokenAccountInfo.clone(), pubkey00AccountInfo.clone(), tokenProgram.clone()],
            signers,
        );
    }
    
    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
