import { Principal } from '@dfinity/principal';
import { YouTubeIdentity, YouTubeMetrics } from './youtube';


export interface VaultData {
  balance: bigint;
  owner: Principal;
  locked_until: bigint;
}

export interface VaultCanister {
  deposit: (amount: bigint) => Promise<{ Ok: string } | { Err: string }>;
  withdraw: (amount: bigint) => Promise<{ Ok: string } | { Err: string }>;
  get_balance: () => Promise<bigint>;
  get_vault_data: () => Promise<VaultData | null>;
}


export interface StreamData {
  id: bigint;
  sender: Principal;
  recipient: Principal;
  amount: bigint;
  start_time: bigint;
  end_time: bigint;
  claimed_amount: bigint;
  is_active: boolean;
}

export interface BeamFiCanister {
  create_stream: (
    recipient: Principal,
    amount: bigint,
    duration: bigint
  ) => Promise<{ Ok: bigint } | { Err: string }>;
  claim_stream: (stream_id: bigint) => Promise<{ Ok: string } | { Err: string }>;
  get_stream: (stream_id: bigint) => Promise<StreamData | null>;
  get_user_streams: (user: Principal) => Promise<StreamData[]>;
  unlock_stream_early: (stream_id: bigint) => Promise<{ Ok: string } | { Err: string }>;
}

// Campaign Factory Types
export interface CampaignMetadata {
  title: string;
  description: string;
  image_url: string;
  category: string;
  target_amount: bigint;
  end_date: bigint;
}

export interface Campaign {
  id: bigint;
  creator: Principal;
  metadata: CampaignMetadata;
  current_amount: bigint;
  backers_count: bigint;
  is_active: boolean;
  created_at: bigint;
}

export interface CampaignFactoryCanister {
  create_campaign: (metadata: CampaignMetadata) => Promise<{ Ok: bigint } | { Err: string }>;
  fund_campaign: (campaign_id: bigint, amount: bigint) => Promise<{ Ok: string } | { Err: string }>;
  get_campaign: (campaign_id: bigint) => Promise<Campaign | null>;
  get_all_campaigns: () => Promise<Campaign[]>;
  get_user_campaigns: (user: Principal) => Promise<Campaign[]>;
}


export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<[string, string]>;
}

export interface NFTRegistryCanister {
  mint: (to: Principal, metadata: TokenMetadata) => Promise<{ Ok: bigint } | { Err: string }>;
  transfer: (token_id: bigint, to: Principal) => Promise<{ Ok: string } | { Err: string }>;
  owner_of: (token_id: bigint) => Promise<Principal | null>;
  
  // YouTube ZK Proof verification methods
  store_youtube_zk_proof: (
    proof_bytes: Uint8Array,
    public_inputs: string[],
    channel_id: string,
    channel_name: string | null,
    proof_type: number,  // Corresponds to ProofType enum
    subscriber_count: bigint | null,
    view_count: bigint | null,
    video_count: bigint | null,
    creation_date: string | null
  ) => Promise<{ Ok: boolean } | { Err: string }>;

  verify_youtube_ownership: (
    principal: Principal, 
    channel_id: string
  ) => Promise<boolean>;
  
  verify_subscriber_count_proof: (
    principal: Principal,
    min_subscribers: bigint
  ) => Promise<{ Ok: boolean } | { Err: string }>;

  verify_view_count_proof: (
    principal: Principal,
    min_views: bigint
  ) => Promise<{ Ok: boolean } | { Err: string }>;

  verify_video_engagement: (
    principal: Principal,
    video_id: string,
    min_likes: bigint | null,
    min_comments: bigint | null,
    min_views: bigint | null
  ) => Promise<{ Ok: boolean } | { Err: string }>;

  get_youtube_identity: (principal: Principal) => Promise<YouTubeIdentity | null>;
  
  get_youtube_metrics: (channel_id: string) => Promise<YouTubeMetrics | null>;
  get_token_metadata: (token_id: bigint) => Promise<TokenMetadata | null>;
  get_user_tokens: (user: Principal) => Promise<bigint[]>;
}

export interface ProposalType {
  EarlyUnlock?: { stream_id: bigint; beneficiary: Principal };
  CampaignRefund?: { campaign_id: bigint; reason: string };
  UpdateRevenueShare?: { campaign_id: bigint; new_percentage: bigint };
  DisputeResolution?: { campaign_id: bigint; disputed_amount: bigint; resolution: string };
  OracleUpdate?: { campaign_id: bigint; new_endpoints: string[] };
  Emergency?: { action: string; target_canister: Principal };
}

export interface Proposal {
  id: bigint;
  proposer: Principal;
  title: string;
  description: string;
  proposal_type: ProposalType;
  voting_deadline: bigint;
  execution_delay: bigint;
  status: 'Active' | 'Passed' | 'Failed' | 'Executed';
  votes_for: bigint;
  votes_against: bigint;
  total_voting_power: bigint;
  created_at: bigint;
}

export interface Vote {
  voter: Principal;
  proposal_id: bigint;
  vote_type: 'For' | 'Against';
  voting_power: bigint;
  timestamp: bigint;
}

export interface DAOConfig {
  voting_period: bigint;
  execution_delay: bigint;
  quorum_threshold: bigint;
  pass_threshold: bigint;
  emergency_threshold: bigint;
}

export interface SNSDAOCanister {
  create_proposal: (
    title: string,
    description: string,
    proposal_type: ProposalType
  ) => Promise<{ Ok: bigint } | { Err: string }>;
  vote_on_proposal: (
    proposal_id: bigint,
    vote_type: 'For' | 'Against'
  ) => Promise<{ Ok: string } | { Err: string }>;
  get_proposal: (proposal_id: bigint) => Promise<Proposal | null>;
  get_all_proposals: () => Promise<Proposal[]>;
  get_user_votes: (user: Principal) => Promise<Vote[]>;
  get_dao_config: () => Promise<DAOConfig | null>;
  set_voting_power: (
    principal: Principal,
    power: bigint,
    locked_until: bigint
  ) => Promise<{ Ok: string } | { Err: string }>;
}


export interface ApiEndpoint {
  platform: string;
  url: string;
  auth_header: string | null;
  data_path: string;
}

export interface OracleConfig {
  campaign_id: bigint;
  endpoints: ApiEndpoint[];
  update_frequency: bigint;
  is_active: boolean;
  last_update: bigint;
}

export interface RevenueData {
  campaign_id: bigint;
  timestamp: bigint;
  revenue_amount: bigint;
  source: string;
  confidence_score: bigint;
}

export interface OracleAggregatorCanister {
  configure_oracle: (
    campaign_id: bigint,
    config: OracleConfig
  ) => Promise<{ Ok: string } | { Err: string }>;
  fetch_revenue_data: (campaign_id: bigint) => Promise<{ Ok: RevenueData[] } | { Err: string }>;
  get_oracle_config: (campaign_id: bigint) => Promise<OracleConfig | null>;
  get_revenue_history: (campaign_id: bigint) => Promise<RevenueData[]>;
  deactivate_oracle: (campaign_id: bigint) => Promise<{ Ok: null } | { Err: string }>;
}
