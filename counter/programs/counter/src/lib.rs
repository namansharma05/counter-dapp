use anchor_lang::prelude::*;

pub mod contexts;
use contexts::*;

pub mod blueprints;

declare_id!("5qir8KuyVwFcUpNvf8c6K81a9iUN96MUTkCQdxr23R2h");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize_counter(ctx: Context<Create>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.authority = *ctx.accounts.authority.key;
        counter_account.count = 0;
        Ok(())
    }

    pub fn increment_counter(ctx: Context<Update>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count += 1;
        Ok(())
    }

    pub fn decrement_counter(ctx: Context<Update>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count -= 1;
        Ok(())
    }

    pub fn close_counter(_ctx: Context<Delete>) -> Result<()> {
        Ok(())
    }
}
