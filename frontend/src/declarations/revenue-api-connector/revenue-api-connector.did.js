export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const RevenueData = IDL.Record({
    'verified' : IDL.Bool,
    'platform' : IDL.Text,
    'currency' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'raw_data' : IDL.Text,
    'amount' : IDL.Nat64,
    'campaign_id' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Vec(RevenueData),
    'Err' : IDL.Text,
  });
  const ApiEndpoint = IDL.Record({
    'url' : IDL.Text,
    'platform' : IDL.Text,
    'data_path' : IDL.Text,
    'auth_header' : IDL.Opt(IDL.Text),
  });
  const OracleConfig = IDL.Record({
    'endpoints' : IDL.Vec(ApiEndpoint),
    'update_frequency' : IDL.Nat64,
    'vault_canister' : IDL.Principal,
    'is_active' : IDL.Bool,
    'last_update' : IDL.Nat64,
    'campaign_id' : IDL.Nat64,
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  return IDL.Service({
    'deactivate_oracle' : IDL.Func([IDL.Nat64], [Result], []),
    'fetch_revenue_data' : IDL.Func([IDL.Nat64], [Result_1], []),
    'get_oracle_config' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(OracleConfig)],
        ['query'],
      ),
    'get_revenue_history' : IDL.Func(
        [IDL.Nat64],
        [IDL.Vec(RevenueData)],
        ['query'],
      ),
    'register_campaign_oracle' : IDL.Func(
        [IDL.Nat64, IDL.Principal, IDL.Vec(ApiEndpoint), IDL.Nat64],
        [Result],
        [],
      ),
    'transform_response' : IDL.Func([TransformArgs], [HttpResponse], []),
  });
};
export const init = ({ IDL }) => { return []; };
