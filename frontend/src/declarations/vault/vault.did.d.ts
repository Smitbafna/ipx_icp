import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BackerInfo {
  'nft_token_id' : [] | [bigint],
  'investment_timestamp' : bigint,
  'amount_invested' : bigint,
  'share_percentage' : number,
  'total_claimed' : bigint,
}
export type ClaimStatus = { 'Paid' : null } |
  { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Pending' : null };
export interface InsuranceClaim {
  'status' : ClaimStatus,
  'claim_id' : bigint,
  'claimer' : Principal,
  'filed_at' : bigint,
  'evidence' : Array<string>,
  'approver' : [] | [Principal],
  'amount' : bigint,
  'resolved_at' : [] | [bigint],
  'reason' : string,
}
export interface InvestmentResult {
  'nft_token_id' : [] | [bigint],
  'share_percentage' : number,
  'message' : string,
  'success' : boolean,
}
export type Result = { 'Ok' : Array<[Principal, bigint]> } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : null } |
  { 'Err' : string };
export interface RevenueUpdate {
  'source' : string,
  'oracle_verification' : boolean,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface SlashEvent {
  'creator' : Principal,
  'executed_at' : bigint,
  'amount_slashed' : bigint,
  'approved_by' : Array<Principal>,
  'beneficiaries' : Array<Principal>,
  'campaign_id' : bigint,
  'reason' : SlashReason,
}
export type SlashReason = { 'RevenueFraud' : null } |
  { 'ProjectAbandonment' : null } |
  { 'Other' : string } |
  { 'MissedRevenueReports' : null } |
  { 'GovernanceDecision' : null };
export interface SlashingConditions {
  'minimum_active_period_days' : bigint,
  'revenue_decline_threshold_percentage' : number,
  'governance_votes_required' : number,
  'missed_revenue_reports_threshold' : number,
}
export interface VaultState {
  'revenue_share_percentage' : number,
  'title' : string,
  'creator' : Principal,
  'current_funding' : bigint,
  'nft_registry_canister' : [] | [Principal],
  'oracle_canister' : [] | [Principal],
  'revenue_history' : Array<RevenueUpdate>,
  'insurance_claims' : Array<InsuranceClaim>,
  'oracle_endpoints' : Array<string>,
  'created_at' : bigint,
  'slashing_conditions' : SlashingConditions,
  'slashed_creators' : Array<SlashEvent>,
  'insurance_coverage_ratio' : number,
  'funding_goal' : bigint,
  'total_revenue' : bigint,
  'stream_canister' : [] | [Principal],
  'insurance_pool_balance' : bigint,
  'insurance_fee_percentage' : number,
  'campaign_id' : bigint,
  'backers' : Array<[Principal, BackerInfo]>,
}
export interface _SERVICE {
  'distribute_payouts' : ActorMethod<[], Result>,
  'file_insurance_claim' : ActorMethod<
    [bigint, string, Array<string>],
    Result_1
  >,
  'get_backer_info' : ActorMethod<[Principal], [] | [BackerInfo]>,
  'get_funding_progress' : ActorMethod<[], [bigint, bigint, number]>,
  'get_insurance_claim' : ActorMethod<[bigint], [] | [InsuranceClaim]>,
  'get_insurance_claims' : ActorMethod<
    [[] | [Principal]],
    Array<InsuranceClaim>
  >,
  'get_insurance_pool_info' : ActorMethod<[], [bigint, number, number]>,
  'get_slash_events' : ActorMethod<[], Array<SlashEvent>>,
  'get_slashing_conditions' : ActorMethod<[], SlashingConditions>,
  'get_vault_state' : ActorMethod<[], [] | [VaultState]>,
  'invest' : ActorMethod<[bigint], InvestmentResult>,
  'mint_nft_for_backer' : ActorMethod<[Principal], Result_1>,
  'process_insurance_claim' : ActorMethod<[bigint, boolean, string], Result_2>,
  'propose_slashing' : ActorMethod<
    [Principal, SlashReason, Array<string>],
    Result_1
  >,
  'set_canister_refs' : ActorMethod<
    [[] | [Principal], [] | [Principal], [] | [Principal]],
    Result_2
  >,
  'update_insurance_settings' : ActorMethod<
    [[] | [number], [] | [number], [] | [SlashingConditions]],
    Result_2
  >,
  'update_revenue' : ActorMethod<[bigint, string, boolean], Result_2>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
