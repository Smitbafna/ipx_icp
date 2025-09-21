export const idlFactory = ({ IDL }) => {
  const ClaimResult = IDL.Record({
    'claimed_amount' : IDL.Nat64,
    'stream_id' : IDL.Nat64,
    'next_claim_time' : IDL.Nat64,
    'remaining_amount' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : ClaimResult, 'Err' : IDL.Text });
  const StreamType = IDL.Variant({
    'Linear' : IDL.Null,
    'Exponential' : IDL.Null,
    'Cliff' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat64), 'Err' : IDL.Text });
  const Stream = IDL.Record({
    'total_amount' : IDL.Nat64,
    'claimed_amount' : IDL.Nat64,
    'amount_per_second' : IDL.Nat64,
    'recipient' : IDL.Principal,
    'end_time' : IDL.Nat64,
    'start_time' : IDL.Nat64,
    'vault_canister' : IDL.Principal,
    'stream_id' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'stream_type' : StreamType,
    'campaign_id' : IDL.Nat64,
  });
  const StreamStats = IDL.Record({
    'active_streams' : IDL.Nat64,
    'total_streams' : IDL.Nat64,
    'total_volume' : IDL.Nat64,
    'claimed_volume' : IDL.Nat64,
  });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'claim_stream' : IDL.Func([IDL.Nat64], [Result], []),
    'create_stream' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat64,
          IDL.Nat64,
          IDL.Nat64,
          IDL.Principal,
          StreamType,
        ],
        [Result_1],
        [],
      ),
    'create_streams' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat64))],
        [Result_2],
        [],
      ),
    'get_claimable_amount' : IDL.Func([IDL.Nat64], [IDL.Nat64], ['query']),
    'get_stream' : IDL.Func([IDL.Nat64], [IDL.Opt(Stream)], ['query']),
    'get_stream_stats' : IDL.Func([], [StreamStats], ['query']),
    'get_user_streams' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Stream)],
        ['query'],
      ),
    'pause_stream' : IDL.Func([IDL.Nat64], [Result_3], []),
    'resume_stream' : IDL.Func([IDL.Nat64], [Result_3], []),
  });
};
export const init = ({ IDL }) => { return []; };
