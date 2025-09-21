import { Principal } from '@dfinity/principal';

export enum ProofType {
  ChannelOwnership = 'ChannelOwnership',
  SubscriberCount = 'SubscriberCount',
  ViewCount = 'ViewCount',
  VideoEngagement = 'VideoEngagement',
  Combined = 'Combined'
}

export interface YouTubeIdentity {
  channel_id: string;
  channel_name?: string;
  verification_timestamp: bigint;
  valid_until?: bigint;
  subscriber_count?: bigint;
  view_count?: bigint;
  video_count?: bigint;
  creation_date?: string;
}

export interface YouTubeMetrics {
  subscriber_count: bigint;
  view_count: bigint;
  video_count: bigint;
  verified_at: bigint;
}

export interface ZkProofData {
  public_inputs: string[];
  proof_bytes: Uint8Array;
  identity: YouTubeIdentity;
  proof_type: ProofType;
}

export interface YouTubeVerificationResult {
  isVerified: boolean;
  identity?: YouTubeIdentity;
  metrics?: YouTubeMetrics;
  error?: string;
}
