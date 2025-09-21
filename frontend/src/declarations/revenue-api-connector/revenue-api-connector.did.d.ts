import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ApiEndpoint {
  'url' : string,
  'platform' : string,
  'data_path' : string,
  'auth_header' : [] | [string],
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface OracleConfig {
  'endpoints' : Array<ApiEndpoint>,
  'update_frequency' : bigint,
  'vault_canister' : Principal,
  'is_active' : boolean,
  'last_update' : bigint,
  'campaign_id' : bigint,
}
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : Array<RevenueData> } |
  { 'Err' : string };
export interface RevenueData {
  'verified' : boolean,
  'platform' : string,
  'currency' : string,
  'timestamp' : bigint,
  'raw_data' : string,
  'amount' : bigint,
  'campaign_id' : bigint,
}
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface _SERVICE {
  'deactivate_oracle' : ActorMethod<[bigint], Result>,
  'fetch_revenue_data' : ActorMethod<[bigint], Result_1>,
  'get_oracle_config' : ActorMethod<[bigint], [] | [OracleConfig]>,
  'get_revenue_history' : ActorMethod<[bigint], Array<RevenueData>>,
  'register_campaign_oracle' : ActorMethod<
    [bigint, Principal, Array<ApiEndpoint>, bigint],
    Result
  >,
  'transform_response' : ActorMethod<[TransformArgs], HttpResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
