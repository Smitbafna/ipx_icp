export const idlFactory = ({ IDL }) => {
  const ProposalType = IDL.Variant({
    'CodeUpgrade' : IDL.Null,
    'ParameterChange' : IDL.Null,
    'Treasury' : IDL.Null,
  });
  const ProposalData = IDL.Record({
    'title' : IDL.Text,
    'voting_period' : IDL.Nat64,
    'description' : IDL.Text,
    'proposal_type' : ProposalType,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Proposal = IDL.Record({
    'id' : IDL.Nat64,
    'voting_deadline' : IDL.Nat64,
    'data' : ProposalData,
    'voters' : IDL.Vec(IDL.Principal),
    'created_at' : IDL.Nat64,
    'proposer' : IDL.Principal,
    'votes_for' : IDL.Nat64,
    'executed' : IDL.Bool,
    'votes_against' : IDL.Nat64,
  });
  const GovernanceStats = IDL.Record({
    'active_proposals' : IDL.Nat64,
    'total_votes_cast' : IDL.Nat64,
    'total_proposals' : IDL.Nat64,
    'treasury_balance' : IDL.Nat64,
  });
  return IDL.Service({
    'create_proposal' : IDL.Func([ProposalData], [Result], []),
    'execute_proposal' : IDL.Func([IDL.Nat64], [Result_1], []),
    'get_active_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_all_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_governance_stats' : IDL.Func([], [GovernanceStats], ['query']),
    'get_proposal' : IDL.Func([IDL.Nat64], [IDL.Opt(Proposal)], ['query']),
    'get_voting_power' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'grant_voting_power' : IDL.Func([IDL.Principal, IDL.Nat64], [Result_1], []),
    'vote' : IDL.Func([IDL.Nat64, IDL.Bool], [Result_1], []),
  });
};
export const init = ({ IDL }) => { return []; };
