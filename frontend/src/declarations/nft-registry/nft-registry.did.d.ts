import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ApprovalArgs { 'token_id' : bigint, 'approved' : Principal }
export interface CollectionMetadata {
  'name' : string,
  'description' : string,
  'image' : string,
  'total_supply' : bigint,
}
export type ProofType = { 'ViewCount' : null } |
  { 'SubscriberCount' : null } |
  { 'Combined' : null } |
  { 'ChannelOwnership' : null } |
  { 'VideoEngagement' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : boolean } |
  { 'Err' : string };
export interface TokenMetadata {
  'token_id' : bigint,
  'owner' : Principal,
  'created_at' : bigint,
  'investment_amount' : bigint,
  'share_percentage' : number,
  'metadata_json' : string,
  'vault_canister' : Principal,
  'campaign_id' : bigint,
}
export interface TransferArgs {
  'to' : Principal,
  'token_id' : bigint,
  'from' : Principal,
}
export interface YouTubeIdentity {
  'channel_id' : string,
  'subscriber_count' : [] | [bigint],
  'view_count' : [] | [bigint],
  'channel_name' : [] | [string],
  'video_count' : [] | [bigint],
  'valid_until' : [] | [bigint],
  'creation_date' : [] | [string],
  'verification_timestamp' : bigint,
}
export interface YouTubeMetrics {
  'subscriber_count' : bigint,
  'view_count' : bigint,
  'video_count' : bigint,
  'verified_at' : bigint,
}
export interface _SERVICE {
  'get_principal_by_youtube_channel' : ActorMethod<[string], [] | [Principal]>,
  'get_youtube_identity' : ActorMethod<[Principal], [] | [YouTubeIdentity]>,
  'get_youtube_metrics' : ActorMethod<[string], [] | [YouTubeMetrics]>,
  'icrc7_approve' : ActorMethod<[ApprovalArgs], Result>,
  'icrc7_balance_of' : ActorMethod<[Principal], bigint>,
  'icrc7_collection_metadata' : ActorMethod<[], CollectionMetadata>,
  'icrc7_description' : ActorMethod<[], string>,
  'icrc7_get_approved' : ActorMethod<[bigint], [] | [Principal]>,
  'icrc7_is_approved_for_all' : ActorMethod<[Principal, Principal], boolean>,
  'icrc7_name' : ActorMethod<[], string>,
  'icrc7_owner_of' : ActorMethod<[bigint], [] | [Principal]>,
  'icrc7_set_approval_for_all' : ActorMethod<[Principal, boolean], Result_1>,
  'icrc7_token_metadata' : ActorMethod<[bigint], [] | [TokenMetadata]>,
  'icrc7_tokens_of' : ActorMethod<[Principal], BigUint64Array | bigint[]>,
  'icrc7_total_supply' : ActorMethod<[], bigint>,
  'icrc7_transfer' : ActorMethod<[TransferArgs], Result>,
  'mint' : ActorMethod<
    [Principal, bigint, Principal, bigint, number, string],
    Result
  >,
  'mint_nft_with_youtube_verification' : ActorMethod<
    [
      Principal,
      bigint,
      Principal,
      bigint,
      number,
      string,
      [] | [string],
      [] | [bigint],
      [] | [bigint],
    ],
    Result
  >,
  'mint_nft_with_youtube_verification_legacy' : ActorMethod<
    [Principal, bigint, Principal, bigint, number, string, [] | [string]],
    Result
  >,
  'set_youtube_verifier_key' : ActorMethod<
    [Uint8Array | number[], ProofType],
    Result_2
  >,
  'set_youtube_verifier_key_legacy' : ActorMethod<
    [Uint8Array | number[]],
    Result_2
  >,
  'store_youtube_zk_proof' : ActorMethod<
    [
      Uint8Array | number[],
      Array<string>,
      string,
      [] | [string],
      ProofType,
      [] | [bigint],
      [] | [bigint],
      [] | [bigint],
      [] | [string],
    ],
    Result_2
  >,
  'store_youtube_zk_proof_legacy' : ActorMethod<
    [Uint8Array | number[], Array<string>, string, [] | [string]],
    Result_2
  >,
  'verify_subscriber_count_proof' : ActorMethod<[Principal, bigint], Result_2>,
  'verify_video_engagement' : ActorMethod<
    [Principal, string, [] | [bigint], [] | [bigint], [] | [bigint]],
    Result_2
  >,
  'verify_view_count_proof' : ActorMethod<[Principal, bigint], Result_2>,
  'verify_youtube_ownership' : ActorMethod<[Principal, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
