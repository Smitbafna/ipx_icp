import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CampaignMetadata {
  'status' : CampaignStatus,
  'revenue_share_percentage' : number,
  'title' : string,
  'creator' : Principal,
  'vault_canister_id' : [] | [Principal],
  'description' : string,
  'oracle_endpoints' : Array<string>,
  'created_at' : bigint,
  'funding_goal' : bigint,
}
export type CampaignStatus = { 'Active' : null } |
  { 'Draft' : null } |
  { 'Funded' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export interface _SERVICE {
  'create_campaign' : ActorMethod<
    [string, string, bigint, number, Array<string>],
    Result
  >,
  'get_active_campaigns' : ActorMethod<[], Array<[bigint, CampaignMetadata]>>,
  'get_all_campaigns' : ActorMethod<[], Array<[bigint, CampaignMetadata]>>,
  'get_campaign' : ActorMethod<[bigint], [] | [CampaignMetadata]>,
  'get_campaigns_by_creator' : ActorMethod<
    [Principal],
    Array<[bigint, CampaignMetadata]>
  >,
  'update_campaign_status' : ActorMethod<[bigint, CampaignStatus], Result_1>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
