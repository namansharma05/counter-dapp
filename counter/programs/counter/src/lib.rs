use anchor_lang::prelude::*;

declare_id!("5qir8KuyVwFcUpNvf8c6K81a9iUN96MUTkCQdxr23R2h");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
