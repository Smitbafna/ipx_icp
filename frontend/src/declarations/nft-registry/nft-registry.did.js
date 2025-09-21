export const idlFactory = ({ IDL }) => {
  const YouTubeIdentity = IDL.Record({
    'channel_id' : IDL.Text,
    'subscriber_count' : IDL.Opt(IDL.Nat64),
    'view_count' : IDL.Opt(IDL.Nat64),
    'channel_name' : IDL.Opt(IDL.Text),
    'video_count' : IDL.Opt(IDL.Nat64),
    'valid_until' : IDL.Opt(IDL.Nat64),
    'creation_date' : IDL.Opt(IDL.Text),
    'verification_timestamp' : IDL.Nat64,
  });
  const YouTubeMetrics = IDL.Record({
    'subscriber_count' : IDL.Nat64,
    'view_count' : IDL.Nat64,
    'video_count' : IDL.Nat64,
    'verified_at' : IDL.Nat64,
  });
  const ApprovalArgs = IDL.Record({
    'token_id' : IDL.Nat64,
    'approved' : IDL.Principal,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const CollectionMetadata = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'image' : IDL.Text,
    'total_supply' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const TokenMetadata = IDL.Record({
    'token_id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'investment_amount' : IDL.Nat64,
    'share_percentage' : IDL.Float64,
    'metadata_json' : IDL.Text,
    'vault_canister' : IDL.Principal,
    'campaign_id' : IDL.Nat64,
  });
  const TransferArgs = IDL.Record({
    'to' : IDL.Principal,
    'token_id' : IDL.Nat64,
    'from' : IDL.Principal,
  });
  const ProofType = IDL.Variant({
    'ViewCount' : IDL.Null,
    'SubscriberCount' : IDL.Null,
    'Combined' : IDL.Null,
    'ChannelOwnership' : IDL.Null,
    'VideoEngagement' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  return IDL.Service({
    'get_principal_by_youtube_channel' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_youtube_identity' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(YouTubeIdentity)],
        ['query'],
      ),
    'get_youtube_metrics' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(YouTubeMetrics)],
        ['query'],
      ),
    'icrc7_approve' : IDL.Func([ApprovalArgs], [Result], []),
    'icrc7_balance_of' : IDL.Func([IDL.Principal], [IDL.Nat64], ['query']),
    'icrc7_collection_metadata' : IDL.Func([], [CollectionMetadata], ['query']),
    'icrc7_description' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_get_approved' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'icrc7_is_approved_for_all' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'icrc7_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_owner_of' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'icrc7_set_approval_for_all' : IDL.Func(
        [IDL.Principal, IDL.Bool],
        [Result_1],
        [],
      ),
    'icrc7_token_metadata' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(TokenMetadata)],
        ['query'],
      ),
    'icrc7_tokens_of' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Nat64)],
        ['query'],
      ),
    'icrc7_total_supply' : IDL.Func([], [IDL.Nat64], ['query']),
    'icrc7_transfer' : IDL.Func([TransferArgs], [Result], []),
    'mint' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat64,
          IDL.Principal,
          IDL.Nat64,
          IDL.Float64,
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'mint_nft_with_youtube_verification' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat64,
          IDL.Principal,
          IDL.Nat64,
          IDL.Float64,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
        ],
        [Result],
        [],
      ),
    'mint_nft_with_youtube_verification_legacy' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat64,
          IDL.Principal,
          IDL.Nat64,
          IDL.Float64,
          IDL.Text,
          IDL.Opt(IDL.Text),
        ],
        [Result],
        [],
      ),
    'set_youtube_verifier_key' : IDL.Func(
        [IDL.Vec(IDL.Nat8), ProofType],
        [Result_2],
        [],
      ),
    'set_youtube_verifier_key_legacy' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [Result_2],
        [],
      ),
    'store_youtube_zk_proof' : IDL.Func(
        [
          IDL.Vec(IDL.Nat8),
          IDL.Vec(IDL.Text),
          IDL.Text,
          IDL.Opt(IDL.Text),
          ProofType,
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Text),
        ],
        [Result_2],
        [],
      ),
    'store_youtube_zk_proof_legacy' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Text), IDL.Text, IDL.Opt(IDL.Text)],
        [Result_2],
        [],
      ),
    'verify_subscriber_count_proof' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [Result_2],
        [],
      ),
    'verify_video_engagement' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
        ],
        [Result_2],
        [],
      ),
    'verify_view_count_proof' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [Result_2],
        [],
      ),
    'verify_youtube_ownership' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Bool],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
