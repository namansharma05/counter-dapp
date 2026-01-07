use anchor_lang::prelude::*;

use crate::blueprints::*;

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref()],
        bump,
    )]
    pub counter_account: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump,
        constraint = counter_account.authority == authority.key()
    )]
    pub counter_account: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump,
        constraint = counter_account.authority == authority.key(),
        close = authority,
    )]
    pub counter_account: Account<'info, Counter>,
}
