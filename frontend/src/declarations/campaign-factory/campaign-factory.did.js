export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const CampaignStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Draft' : IDL.Null,
    'Funded' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const CampaignMetadata = IDL.Record({
    'status' : CampaignStatus,
    'revenue_share_percentage' : IDL.Nat8,
    'title' : IDL.Text,
    'creator' : IDL.Principal,
    'vault_canister_id' : IDL.Opt(IDL.Principal),
    'description' : IDL.Text,
    'oracle_endpoints' : IDL.Vec(IDL.Text),
    'created_at' : IDL.Nat64,
    'funding_goal' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'create_campaign' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64, IDL.Nat8, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
    'get_active_campaigns' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, CampaignMetadata))],
        ['query'],
      ),
    'get_all_campaigns' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, CampaignMetadata))],
        ['query'],
      ),
    'get_campaign' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(CampaignMetadata)],
        ['query'],
      ),
    'get_campaigns_by_creator' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Nat64, CampaignMetadata))],
        ['query'],
      ),
    'update_campaign_status' : IDL.Func(
        [IDL.Nat64, CampaignStatus],
        [Result_1],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
