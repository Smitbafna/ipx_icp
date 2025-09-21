import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ClaimResult {
  'claimed_amount' : bigint,
  'stream_id' : bigint,
  'next_claim_time' : bigint,
  'remaining_amount' : bigint,
}
export type Result = { 'Ok' : ClaimResult } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : BigUint64Array | bigint[] } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : null } |
  { 'Err' : string };
export interface Stream {
  'total_amount' : bigint,
  'claimed_amount' : bigint,
  'amount_per_second' : bigint,
  'recipient' : Principal,
  'end_time' : bigint,
  'start_time' : bigint,
  'vault_canister' : Principal,
  'stream_id' : bigint,
  'is_active' : boolean,
  'stream_type' : StreamType,
  'campaign_id' : bigint,
}
export interface StreamStats {
  'active_streams' : bigint,
  'total_streams' : bigint,
  'total_volume' : bigint,
  'claimed_volume' : bigint,
}
export type StreamType = { 'Linear' : null } |
  { 'Exponential' : null } |
  { 'Cliff' : null };
export interface _SERVICE {
  'claim_stream' : ActorMethod<[bigint], Result>,
  'create_stream' : ActorMethod<
    [Principal, bigint, bigint, bigint, Principal, StreamType],
    Result_1
  >,
  'create_streams' : ActorMethod<[Array<[Principal, bigint]>], Result_2>,
  'get_claimable_amount' : ActorMethod<[bigint], bigint>,
  'get_stream' : ActorMethod<[bigint], [] | [Stream]>,
  'get_stream_stats' : ActorMethod<[], StreamStats>,
  'get_user_streams' : ActorMethod<[Principal], Array<Stream>>,
  'pause_stream' : ActorMethod<[bigint], Result_3>,
  'resume_stream' : ActorMethod<[bigint], Result_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
