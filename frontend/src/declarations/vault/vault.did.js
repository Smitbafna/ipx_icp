export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat64)),
    'Err' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const BackerInfo = IDL.Record({
    'nft_token_id' : IDL.Opt(IDL.Nat64),
    'investment_timestamp' : IDL.Nat64,
    'amount_invested' : IDL.Nat64,
    'share_percentage' : IDL.Float64,
    'total_claimed' : IDL.Nat64,
  });
  const ClaimStatus = IDL.Variant({
    'Paid' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const InsuranceClaim = IDL.Record({
    'status' : ClaimStatus,
    'claim_id' : IDL.Nat64,
    'claimer' : IDL.Principal,
    'filed_at' : IDL.Nat64,
    'evidence' : IDL.Vec(IDL.Text),
    'approver' : IDL.Opt(IDL.Principal),
    'amount' : IDL.Nat64,
    'resolved_at' : IDL.Opt(IDL.Nat64),
    'reason' : IDL.Text,
  });
  const SlashReason = IDL.Variant({
    'RevenueFraud' : IDL.Null,
    'ProjectAbandonment' : IDL.Null,
    'Other' : IDL.Text,
    'MissedRevenueReports' : IDL.Null,
    'GovernanceDecision' : IDL.Null,
  });
  const SlashEvent = IDL.Record({
    'creator' : IDL.Principal,
    'executed_at' : IDL.Nat64,
    'amount_slashed' : IDL.Nat64,
    'approved_by' : IDL.Vec(IDL.Principal),
    'beneficiaries' : IDL.Vec(IDL.Principal),
    'campaign_id' : IDL.Nat64,
    'reason' : SlashReason,
  });
  const SlashingConditions = IDL.Record({
    'minimum_active_period_days' : IDL.Nat64,
    'revenue_decline_threshold_percentage' : IDL.Nat8,
    'governance_votes_required' : IDL.Nat8,
    'missed_revenue_reports_threshold' : IDL.Nat8,
  });
  const RevenueUpdate = IDL.Record({
    'source' : IDL.Text,
    'oracle_verification' : IDL.Bool,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat64,
  });
  const VaultState = IDL.Record({
    'revenue_share_percentage' : IDL.Nat8,
    'title' : IDL.Text,
    'creator' : IDL.Principal,
    'current_funding' : IDL.Nat64,
    'nft_registry_canister' : IDL.Opt(IDL.Principal),
    'oracle_canister' : IDL.Opt(IDL.Principal),
    'revenue_history' : IDL.Vec(RevenueUpdate),
    'insurance_claims' : IDL.Vec(InsuranceClaim),
    'oracle_endpoints' : IDL.Vec(IDL.Text),
    'created_at' : IDL.Nat64,
    'slashing_conditions' : SlashingConditions,
    'slashed_creators' : IDL.Vec(SlashEvent),
    'insurance_coverage_ratio' : IDL.Nat8,
    'funding_goal' : IDL.Nat64,
    'total_revenue' : IDL.Nat64,
    'stream_canister' : IDL.Opt(IDL.Principal),
    'insurance_pool_balance' : IDL.Nat64,
    'insurance_fee_percentage' : IDL.Nat8,
    'campaign_id' : IDL.Nat64,
    'backers' : IDL.Vec(IDL.Tuple(IDL.Principal, BackerInfo)),
  });
  const InvestmentResult = IDL.Record({
    'nft_token_id' : IDL.Opt(IDL.Nat64),
    'share_percentage' : IDL.Float64,
    'message' : IDL.Text,
    'success' : IDL.Bool,
  });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'distribute_payouts' : IDL.Func([], [Result], []),
    'file_insurance_claim' : IDL.Func(
        [IDL.Nat64, IDL.Text, IDL.Vec(IDL.Text)],
        [Result_1],
        [],
      ),
    'get_backer_info' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(BackerInfo)],
        ['query'],
      ),
    'get_funding_progress' : IDL.Func(
        [],
        [IDL.Nat64, IDL.Nat64, IDL.Float64],
        ['query'],
      ),
    'get_insurance_claim' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(InsuranceClaim)],
        ['query'],
      ),
    'get_insurance_claims' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Vec(InsuranceClaim)],
        ['query'],
      ),
    'get_insurance_pool_info' : IDL.Func(
        [],
        [IDL.Nat64, IDL.Nat8, IDL.Nat8],
        ['query'],
      ),
    'get_slash_events' : IDL.Func([], [IDL.Vec(SlashEvent)], ['query']),
    'get_slashing_conditions' : IDL.Func([], [SlashingConditions], ['query']),
    'get_vault_state' : IDL.Func([], [IDL.Opt(VaultState)], ['query']),
    'invest' : IDL.Func([IDL.Nat64], [InvestmentResult], []),
    'mint_nft_for_backer' : IDL.Func([IDL.Principal], [Result_1], []),
    'process_insurance_claim' : IDL.Func(
        [IDL.Nat64, IDL.Bool, IDL.Text],
        [Result_2],
        [],
      ),
    'propose_slashing' : IDL.Func(
        [IDL.Principal, SlashReason, IDL.Vec(IDL.Text)],
        [Result_1],
        [],
      ),
    'set_canister_refs' : IDL.Func(
        [
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Principal),
        ],
        [Result_2],
        [],
      ),
    'update_insurance_settings' : IDL.Func(
        [IDL.Opt(IDL.Nat8), IDL.Opt(IDL.Nat8), IDL.Opt(SlashingConditions)],
        [Result_2],
        [],
      ),
    'update_revenue' : IDL.Func(
        [IDL.Nat64, IDL.Text, IDL.Bool],
        [Result_2],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
