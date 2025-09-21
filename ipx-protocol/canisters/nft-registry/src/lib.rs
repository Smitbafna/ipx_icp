use ic_cdk::api::{msg_caller, time};
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ark_bn254::{Bn254, Fr, G1Affine, G2Affine};
use ark_ff::{FromBytes, PrimeField};
use ark_groth16::{prepare_verifying_key, verify_proof, Proof, VerifyingKey};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use sha2::{Sha256, Digest};
use hex;



type TokenId = u64;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub token_id: TokenId,
    pub owner: Principal,
    pub campaign_id: u64,
    pub vault_canister: Principal,
    pub investment_amount: u64,
    pub share_percentage: f64,
    pub metadata_json: String,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransferArgs {
    pub token_id: TokenId,
    pub from: Principal,
    pub to: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApprovalArgs {
    pub token_id: TokenId,
    pub approved: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct YouTubeIdentity {
    pub channel_id: String,
    pub channel_name: Option<String>,
    pub verification_timestamp: u64,
    pub valid_until: Option<u64>,
    pub subscriber_count: Option<u64>,
    pub view_count: Option<u64>,
    pub video_count: Option<u64>,
    pub creation_date: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct YouTubeMetrics {
    pub subscriber_count: u64,
    pub view_count: u64,
    pub video_count: u64,
    pub verified_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ZkProofData {
    pub public_inputs: Vec<String>,
    pub proof_bytes: Vec<u8>,
    pub identity: YouTubeIdentity,
    pub proof_type: ProofType,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Copy)]
pub enum ProofType {
    ChannelOwnership,
    SubscriberCount,
    ViewCount,
    VideoEngagement,
    Combined,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CollectionMetadata {
    pub name: String,
    pub description: String,
    pub image: String,
    pub total_supply: u64,
}

thread_local! {
    static TOKENS: RefCell<HashMap<TokenId, TokenMetadata>> = RefCell::new(HashMap::new());
    static TOKEN_APPROVALS: RefCell<HashMap<TokenId, Principal>> = RefCell::new(HashMap::new());
    static OPERATOR_APPROVALS: RefCell<HashMap<(Principal, Principal), bool>> = RefCell::new(HashMap::new());
    static TOKEN_COUNTER: RefCell<TokenId> = RefCell::new(0);
    static COLLECTION_METADATA: RefCell<CollectionMetadata> = RefCell::new(
        CollectionMetadata {
            name: "IPX Campaign NFTs".to_string(),
            description: "NFTs representing investments in IPX Protocol campaigns".to_string(),
            image: "https://ipx-protocol.com/collection-image.png".to_string(),
            total_supply: 0,
        }
    );
    
    // YouTube Identity verification storage
    static PRINCIPAL_TO_YOUTUBE_PROOF: RefCell<HashMap<Principal, ZkProofData>> = RefCell::new(HashMap::new());
    static CHANNEL_TO_PRINCIPAL: RefCell<HashMap<String, Principal>> = RefCell::new(HashMap::new());
    
    // Multiple verifier keys for different types of proofs
    static VERIFIER_KEYS: RefCell<HashMap<ProofType, Vec<u8>>> = RefCell::new(HashMap::new());
    
    // Legacy verifier key for backward compatibility
    static VERIFIER_KEY: RefCell<Option<Vec<u8>>> = RefCell::new(None);
    
    // YouTube metrics storage
    static YOUTUBE_METRICS: RefCell<HashMap<String, YouTubeMetrics>> = RefCell::new(HashMap::new());
    
    // Admin principals allowed to set the verifier keys
    static ADMINS: RefCell<Vec<Principal>> = RefCell::new(vec![
        Principal::from_text("sgymv-uiaaa-aaaaa-aaaia-cai").unwrap(), 
    ]);
}

#[init]
fn init() {
    ic_cdk::println!("NFT Registry (ICRC-7 compliant) initialized");
}


#[query]
fn icrc7_collection_metadata() -> CollectionMetadata {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().clone())
}

#[query]
fn icrc7_name() -> String {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().name.clone())
}

#[query]
fn icrc7_description() -> String {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().description.clone())
}

#[query]
fn icrc7_total_supply() -> u64 {
    TOKENS.with(|tokens| tokens.borrow().len() as u64)
}

#[query]
fn icrc7_owner_of(token_id: TokenId) -> Option<Principal> {
    TOKENS.with(|tokens| {
        tokens.borrow().get(&token_id).map(|token| token.owner)
    })
}

#[query]
fn icrc7_balance_of(owner: Principal) -> u64 {
    TOKENS.with(|tokens| {
        tokens.borrow().iter()
            .filter(|(_, token)| token.owner == owner)
            .count() as u64
    })
}

#[query]
fn icrc7_tokens_of(owner: Principal) -> Vec<TokenId> {
    TOKENS.with(|tokens| {
        tokens.borrow().iter()
            .filter(|(_, token)| token.owner == owner)
            .map(|(token_id, _)| *token_id)
            .collect()
    })
}

#[query]
fn icrc7_token_metadata(token_id: TokenId) -> Option<TokenMetadata> {
    TOKENS.with(|tokens| tokens.borrow().get(&token_id).cloned())
}

#[update]
fn icrc7_transfer(args: TransferArgs) -> Result<TokenId, String> {
    let caller = msg_caller();
    
    // Verify ownership or approval
    let token = TOKENS.with(|tokens| tokens.borrow().get(&args.token_id).cloned());
    
    match token {
        Some(mut token_data) => {
            if token_data.owner != caller && !is_approved(args.token_id, caller) {
                return Err("Caller is not owner or approved".to_string());
            }
            
            if token_data.owner != args.from {
                return Err("From address doesn't match token owner".to_string());
            }
            
            // Update ownership
            token_data.owner = args.to;
            
            TOKENS.with(|tokens| {
                tokens.borrow_mut().insert(args.token_id, token_data);
            });
            
            // Clear approvals
            TOKEN_APPROVALS.with(|approvals| {
                approvals.borrow_mut().remove(&args.token_id);
            });
            
            ic_cdk::println!("Token {} transferred from {} to {}", 
                args.token_id, args.from.to_text(), args.to.to_text());
            
            Ok(args.token_id)
        }
        None => Err("Token not found".to_string()),
    }
}

// Helper function to check if a caller is approved for a token
fn is_approved(token_id: TokenId, caller: Principal) -> bool {
    TOKEN_APPROVALS.with(|approvals| {
        approvals.borrow().get(&token_id).map_or(false, |approved| *approved == caller)
    })
}

#[update]
fn icrc7_approve(args: ApprovalArgs) -> Result<TokenId, String> {
    let caller = msg_caller();
    
    let token = TOKENS.with(|tokens| tokens.borrow().get(&args.token_id).cloned());
    
    match token {
        Some(token_data) => {
            if token_data.owner != caller {
                return Err("Only token owner can approve".to_string());
            }
            
            TOKEN_APPROVALS.with(|approvals| {
                approvals.borrow_mut().insert(args.token_id, args.approved);
            });
            
            Ok(args.token_id)
        }
        None => Err("Token not found".to_string()),
    }
}

#[query]
fn icrc7_get_approved(token_id: TokenId) -> Option<Principal> {
    TOKEN_APPROVALS.with(|approvals| approvals.borrow().get(&token_id).copied())
}

#[update]
fn icrc7_set_approval_for_all(operator: Principal, approved: bool) -> Result<(), String> {
    let caller = msg_caller();
    
    OPERATOR_APPROVALS.with(|approvals| {
        approvals.borrow_mut().insert((caller, operator), approved);
    });
    
    Ok(())
}

#[query]
fn icrc7_is_approved_for_all(owner: Principal, operator: Principal) -> bool {
    OPERATOR_APPROVALS.with(|approvals| {
        approvals.borrow().get(&(owner, operator)).copied().unwrap_or(false)
    })
}


#[update]
fn mint(
    to: Principal,
    campaign_id: u64,
    vault_canister: Principal,
    investment_amount: u64,
    share_percentage: f64,
    metadata_json: String,
) -> Result<TokenId, String> {
    let _caller = msg_caller(); // Prefix with underscore to acknowledge it's not used
    

    
    let token_id = TOKEN_COUNTER.with(|counter| {
        let current = *counter.borrow();
        let next = current + 1;
        *counter.borrow_mut() = next;
        next
    });
    
    let token_metadata = TokenMetadata {
        token_id,
        owner: to,
        campaign_id,
        vault_canister,
        investment_amount,
        share_percentage,
        metadata_json,
        created_at: time(),
    };
    
    TOKENS.with(|tokens| {
        tokens.borrow_mut().insert(token_id, token_metadata);
    });
    
    // Update total supply
    COLLECTION_METADATA.with(|metadata| {
        metadata.borrow_mut().total_supply += 1;
    });
    
    ic_cdk::println!("NFT {} minted for {} (campaign {})", token_id, to.to_text(), campaign_id);
    
    Ok(token_id)
}



#[update]
fn set_youtube_verifier_key(key: Vec<u8>, proof_type: ProofType) -> Result<bool, String> {
    let caller = msg_caller();
    
    // Check if caller is an admin
    let is_admin = ADMINS.with(|admins| {
        admins.borrow().contains(&caller)
    });
    
    if !is_admin {
        return Err("Unauthorized: only admins can set verifier key".to_string());
    }
    
    // Validate the key by attempting to deserialize it
    match ark_groth16::VerifyingKey::<ark_bn254::Bn254>::deserialize(&key[..]) {
        Ok(_) => {
            // Key is valid, store it for the specified proof type
            VERIFIER_KEYS.with(|v| {
                v.borrow_mut().insert(proof_type, key);
            });
            Ok(true)
        },
        Err(e) => {
            Err(format!("Invalid verifying key format: {:?}", e))
        }
    }
}

#[update]
fn set_youtube_verifier_key_legacy(key: Vec<u8>) -> Result<bool, String> {
    // For backward compatibility
    set_youtube_verifier_key(key, ProofType::ChannelOwnership)
}



// Enhanced Groth16 ZK verification implementation with proof type
fn verify_zk_proof(
    proof_bytes: &[u8], 
    public_inputs: &[String], 
    verifier_key_bytes: &[u8],
    proof_type: Option<ProofType>
) -> Result<bool, String> {
    // Log verification attempt
    ic_cdk::println!("Verifying ZK proof for type: {:?}", proof_type);
    
    // Step 1: Deserialize the verification key
    let verifying_key = VerifyingKey::<Bn254>::deserialize(verifier_key_bytes)
        .map_err(|e| format!("Failed to deserialize verification key: {:?}", e))?;
    
    // Step 2: Prepare the verification key
    let prepared_verifying_key = prepare_verifying_key(&verifying_key);
    
    // Step 3: Deserialize the proof
    let proof = Proof::<Bn254>::deserialize(proof_bytes)
        .map_err(|e| format!("Failed to deserialize proof: {:?}", e))?;
    
    // Step 4: Parse the public inputs (convert from hex strings to field elements)
    let mut public_inputs_fr = Vec::with_capacity(public_inputs.len());
    for input in public_inputs {
        // Remove "0x" prefix if present
        let input_str = if input.starts_with("0x") { &input[2..] } else { input };
        
        // Convert hex string to bytes
        let bytes = hex::decode(input_str)
            .map_err(|e| format!("Failed to decode public input as hex: {:?}", e))?;
        
        // Convert bytes to field element
        let fr = Fr::read(&bytes[..])
            .map_err(|e| format!("Failed to convert bytes to field element: {:?}", e))?;
            
        public_inputs_fr.push(fr);
    }
    
    // Step 5: Verify the proof
    let verification_result = verify_proof(&prepared_verifying_key, &proof, &public_inputs_fr);
    
    // Additional validation for specific proof types
    if let Some(proof_type) = proof_type {
        // For subscriber count and view count proofs, we need to validate the public inputs format
        match proof_type {
            ProofType::SubscriberCount => {
                if public_inputs.len() < 2 {
                    return Err("SubscriberCount proof requires at least 2 public inputs".to_string());
                }
            },
            ProofType::ViewCount => {
                if public_inputs.len() < 2 {
                    return Err("ViewCount proof requires at least 2 public inputs".to_string());
                }
            },
            ProofType::VideoEngagement => {
                if public_inputs.len() < 3 {
                    return Err("VideoEngagement proof requires at least 3 public inputs".to_string());
                }
            },
            _ => {}
        }
    }
    
    // Return the result with detailed logging
    match verification_result {
        Ok(true) => {
            ic_cdk::println!("ZK proof verification succeeded for type: {:?}", proof_type);
            Ok(true)
        },
        Ok(false) => {
            ic_cdk::println!("ZK proof verification failed for type: {:?}", proof_type);
            Ok(false)
        },
        Err(e) => {
            ic_cdk::println!("ZK proof verification error for type: {:?}: {:?}", proof_type, e);
            Err(format!("Proof verification error: {:?}", e))
        },
    }
}

#[update]
fn store_youtube_zk_proof(
    proof_bytes: Vec<u8>,
    public_inputs: Vec<String>,
    channel_id: String,
    channel_name: Option<String>,
    proof_type: ProofType,
    subscriber_count: Option<u64>,
    view_count: Option<u64>,
    video_count: Option<u64>,
    creation_date: Option<String>
) -> Result<bool, String> {
    // Get the caller's principal
    let caller = msg_caller();
    
   
    let key = VERIFIER_KEYS.with(|v| {
        v.borrow().get(&proof_type).cloned()
    });
    
    let key = match key {
        Some(k) => k,
        None => {
            if proof_type == ProofType::ChannelOwnership {
                VERIFIER_KEY.with(|v| v.borrow().clone()).ok_or_else(|| "Verifier key not set".to_string())?
            } else {
                return Err(format!("Verifier key not set for proof type: {:?}", proof_type));
            }
        },
    };
    
    // Verify the ZK proof
    let is_valid = verify_zk_proof(&proof_bytes, &public_inputs, &key, Some(proof_type.clone()))
        .map_err(|e| format!("Failed to verify ZK proof: {}", e))?;
    
    if !is_valid {
        return Err("Invalid ZK proof".to_string());
    }
    
    let now = time();
    let youtube_identity = YouTubeIdentity {
        channel_id: channel_id.clone(),
        channel_name,
        verification_timestamp: now,
        valid_until: Some(now + 30 * 24 * 60 * 60 * 1_000_000_000), // 30 days in nanoseconds
        subscriber_count,
        view_count,
        video_count,
        creation_date,
    };
    
    // Store metrics if available
    if let (Some(subs), Some(views), Some(videos)) = (subscriber_count, view_count, video_count) {
        let metrics = YouTubeMetrics {
            subscriber_count: subs,
            view_count: views,
            video_count: videos,
            verified_at: now,
        };
        
        YOUTUBE_METRICS.with(|m| {
            m.borrow_mut().insert(channel_id.clone(), metrics);
        });
    }
    
    let proof_data = ZkProofData {
        public_inputs,
        proof_bytes,
        identity: youtube_identity,
        proof_type,
    };
    
    // Store the mapping from principal to proof
    PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        p.borrow_mut().insert(caller, proof_data);
    });
    
    // Store the mapping from channel_id to principal
    CHANNEL_TO_PRINCIPAL.with(|c| {
        c.borrow_mut().insert(channel_id, caller);
    });
    
    Ok(true)
}

// Compatibility method for older clients
#[update]
fn store_youtube_zk_proof_legacy(
    proof_bytes: Vec<u8>,
    public_inputs: Vec<String>,
    channel_id: String,
    channel_name: Option<String>
) -> Result<bool, String> {
    store_youtube_zk_proof(
        proof_bytes,
        public_inputs,
        channel_id,
        channel_name,
        ProofType::ChannelOwnership,
        None,
        None,
        None,
        None
    )
}

#[update]
fn verify_subscriber_count_proof(
    principal: Principal,
    min_subscribers: u64
) -> Result<bool, String> {
    // Get the proof data for the principal
    let proof_data = PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        p.borrow().get(&principal).cloned()
    });
    
    match proof_data {
        Some(data) => {
            // Check if the proof type is relevant for subscriber verification
            if data.proof_type != ProofType::SubscriberCount && data.proof_type != ProofType::Combined {
                return Err("No subscriber count proof available for this principal".to_string());
            }
            
            // Check if the identity has subscriber count data
            if let Some(count) = data.identity.subscriber_count {
                // Verify that the subscriber count meets the minimum requirement
                Ok(count >= min_subscribers)
            } else {
                Err("No subscriber count data available".to_string())
            }
        },
        None => Err("No YouTube proof registered for this principal".to_string()),
    }
}

#[update]
fn verify_view_count_proof(
    principal: Principal,
    min_views: u64
) -> Result<bool, String> {
    // Get the proof data for the principal
    let proof_data = PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        p.borrow().get(&principal).cloned()
    });
    
    match proof_data {
        Some(data) => {
          
            if data.proof_type != ProofType::ViewCount && data.proof_type != ProofType::Combined {
                return Err("No view count proof available for this principal".to_string());
            }
            
            // Check if the identity has view count data
            if let Some(count) = data.identity.view_count {
                // Verify that the view count meets the minimum requirement
                Ok(count >= min_views)
            } else {
                Err("No view count data available".to_string())
            }
        },
        None => Err("No YouTube proof registered for this principal".to_string()),
    }
}

#[query]
fn get_youtube_metrics(channel_id: String) -> Option<YouTubeMetrics> {
    YOUTUBE_METRICS.with(|m| {
        m.borrow().get(&channel_id).cloned()
    })
}

#[update]
fn verify_video_engagement(
    principal: Principal,
    video_id: String,
    min_likes: Option<u64>,
    min_comments: Option<u64>,
    min_views: Option<u64>
) -> Result<bool, String> {
    // Get the proof data for the principal
    let proof_data = PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        p.borrow().get(&principal).cloned()
    });
    
    match proof_data {
        Some(data) => {
            // Check if the proof type supports video engagement
            if data.proof_type != ProofType::VideoEngagement && data.proof_type != ProofType::Combined {
                return Err("No video engagement proof available for this principal".to_string());
            }
            
            // For video engagement, we expect the first public input to be the video ID hash
            if data.public_inputs.len() < 4 {
                return Err("Invalid video engagement proof format".to_string());
            }
            
            // Generate hash of the provided video ID to compare with the proof
            let mut hasher = Sha256::new();
            hasher.update(video_id.as_bytes());
            let hash_result = hasher.finalize();
            let video_hash_hex = hex::encode(hash_result);
            
            // The first public input should be the video hash
            let proof_video_hash = if data.public_inputs[0].starts_with("0x") {
                data.public_inputs[0][2..].to_string()
            } else {
                data.public_inputs[0].clone()
            };
            
            // Check if the video hash matches
            if video_hash_hex != proof_video_hash {
                return Err("Video ID doesn't match the proof".to_string());
            }
            
            // Extract engagement metrics from the public inputs
            let views = u64::from_str_radix(&data.public_inputs[1], 16).unwrap_or(0);
            let likes = u64::from_str_radix(&data.public_inputs[2], 16).unwrap_or(0);
            let comments = u64::from_str_radix(&data.public_inputs[3], 16).unwrap_or(0);
            
            // Check if the engagement meets the minimum requirements
            let mut meets_requirements = true;
            
            if let Some(min) = min_views {
                meets_requirements = meets_requirements && views >= min;
            }
            
            if let Some(min) = min_likes {
                meets_requirements = meets_requirements && likes >= min;
            }
            
            if let Some(min) = min_comments {
                meets_requirements = meets_requirements && comments >= min;
            }
            
            Ok(meets_requirements)
        },
        None => Err("No YouTube proof registered for this principal".to_string()),
    }
}

#[query]
fn verify_youtube_ownership(principal: Principal, channel_id: String) -> bool {
    // Check if the principal has a verified YouTube identity
    PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        if let Some(proof_data) = p.borrow().get(&principal) {
            // Check if the identity matches the requested channel ID
            if proof_data.identity.channel_id == channel_id {
                // Check if the verification is still valid
                if let Some(valid_until) = proof_data.identity.valid_until {
                    return valid_until > time();
                }
                return true;
            }
        }
        false
    })
}

#[query]
fn get_youtube_identity(principal: Principal) -> Option<YouTubeIdentity> {
    PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| {
        p.borrow().get(&principal).map(|proof_data| proof_data.identity.clone())
    })
}

#[query]
fn get_principal_by_youtube_channel(channel_id: String) -> Option<Principal> {
    CHANNEL_TO_PRINCIPAL.with(|c| {
        c.borrow().get(&channel_id).copied()
    })
}

// Enhanced NFT minting with YouTube identity verification
#[update]
fn mint_nft_with_youtube_verification(
    to: Principal,
    campaign_id: u64, 
    vault_canister: Principal,
    investment_amount: u64,
    share_percentage: f64,
    metadata_json: String,
    youtube_channel_id: Option<String>,
    min_subscribers: Option<u64>,
    min_views: Option<u64>
) -> Result<TokenId, String> {
    // First check for channel verification if needed
    if let Some(channel_id) = youtube_channel_id.clone() {
        let is_verified = verify_youtube_ownership(to, channel_id);
        if !is_verified {
            return Err("User does not have a verified ownership of the specified YouTube channel".to_string());
        }
        
        // If minimum requirements are specified, verify them
        if let Some(min_subs) = min_subscribers {
            match verify_subscriber_count_proof(to, min_subs) {
                Ok(true) => {}, // Meets minimum requirements
                Ok(false) => return Err(format!("Channel does not meet minimum subscriber count of {}", min_subs)),
                Err(e) => return Err(format!("Error verifying subscriber count: {}", e)),
            }
        }
        
        if let Some(min_view_count) = min_views {
            match verify_view_count_proof(to, min_view_count) {
                Ok(true) => {}, // Meets minimum requirements
                Ok(false) => return Err(format!("Channel does not meet minimum view count of {}", min_view_count)),
                Err(e) => return Err(format!("Error verifying view count: {}", e)),
            }
        }
    }
    
    // Get YouTube metrics if available to include in metadata
    let youtube_metrics_json = if let Some(channel_id) = youtube_channel_id {
        YOUTUBE_METRICS.with(|m| {
            if let Some(metrics) = m.borrow().get(&channel_id) {
                Some(format!(
                    r#", "youtube_metrics": {{"subscribers": {}, "views": {}, "videos": {}, "verified_at": {}}}"#,
                    metrics.subscriber_count, metrics.view_count, metrics.video_count, metrics.verified_at
                ))
            } else {
                None
            }
        })
    } else {
        None
    };
    
    // Enhanced metadata with YouTube metrics if available
    let enhanced_metadata = if let Some(metrics_json) = youtube_metrics_json {
        // Insert the YouTube metrics into the JSON metadata
        if metadata_json.ends_with("}") {
            let metadata_without_closing = &metadata_json[0..metadata_json.len()-1];
            format!("{}{}}}", metadata_without_closing, metrics_json)
        } else {
            format!("{}{}", metadata_json, metrics_json)
        }
    } else {
        metadata_json
    };
    
    let token_id = TOKEN_COUNTER.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() += 1;
        id
    });
    
    let token_metadata = TokenMetadata {
        token_id,
        owner: to,
        campaign_id,
        vault_canister,
        investment_amount,
        share_percentage,
        metadata_json: enhanced_metadata,
        created_at: time(),
    };
    
    TOKENS.with(|tokens| {
        tokens.borrow_mut().insert(token_id, token_metadata);
    });
    
    // Update total supply
    COLLECTION_METADATA.with(|metadata| {
        metadata.borrow_mut().total_supply += 1;
    });
    
    ic_cdk::println!("NFT {} minted for {} (campaign {})", token_id, to.to_text(), campaign_id);
    
    Ok(token_id)
}

// Legacy method for backward compatibility
#[update]
fn mint_nft_with_youtube_verification_legacy(
    to: Principal,
    campaign_id: u64, 
    vault_canister: Principal,
    investment_amount: u64,
    share_percentage: f64,
    metadata_json: String,
    youtube_channel_id: Option<String>
) -> Result<TokenId, String> {
    mint_nft_with_youtube_verification(
        to,
        campaign_id,
        vault_canister,
        investment_amount,
        share_percentage,
        metadata_json,
        youtube_channel_id,
        None,
        None
    )
}

// Stable storage management
#[pre_upgrade]
fn pre_upgrade() {
    // Save the existing NFT state
    let tokens = TOKENS.with(|t| t.borrow().clone());
    let token_approvals = TOKEN_APPROVALS.with(|t| t.borrow().clone());
    let operator_approvals = OPERATOR_APPROVALS.with(|o| o.borrow().clone());
    let token_counter = TOKEN_COUNTER.with(|c| *c.borrow());
    let collection_metadata = COLLECTION_METADATA.with(|m| m.borrow().clone());
    
    // Save the YouTube identity verification state
    let principal_to_youtube_proof = PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| p.borrow().clone());
    let channel_to_principal = CHANNEL_TO_PRINCIPAL.with(|c| c.borrow().clone());
    let verifier_keys = VERIFIER_KEYS.with(|v| v.borrow().clone());
    let verifier_key = VERIFIER_KEY.with(|v| v.borrow().clone());
    let youtube_metrics = YOUTUBE_METRICS.with(|m| m.borrow().clone());
    
   
    let state = (
        tokens, 
        token_approvals, 
        operator_approvals, 
        token_counter, 
        collection_metadata,
        principal_to_youtube_proof,
        channel_to_principal,
        verifier_key,
        verifier_keys,
        youtube_metrics
    );
    
    match ic_cdk::storage::stable_save((state,)) {
        Ok(_) => (),
        Err(e) => ic_cdk::trap(&format!("Failed to save state: {:?}", e)),
    }
}

#[post_upgrade]
fn post_upgrade() {
    // Try to restore with the new state format first
    let new_format = ic_cdk::storage::stable_restore::<((
        HashMap<TokenId, TokenMetadata>,
        HashMap<TokenId, Principal>,
        HashMap<(Principal, Principal), bool>,
        TokenId,
        CollectionMetadata,
        HashMap<Principal, ZkProofData>,
        HashMap<String, Principal>,
        Option<Vec<u8>>,
        HashMap<ProofType, Vec<u8>>,
        HashMap<String, YouTubeMetrics>
    ),)>();
    
    match new_format {
        Ok((state,)) => {
            let (
                tokens, 
                token_approvals, 
                operator_approvals, 
                token_counter, 
                collection_metadata,
                principal_to_youtube_proof,
                channel_to_principal,
                verifier_key,
                verifier_keys,
                youtube_metrics
            ) = state;
            
            // Restore all state
            TOKENS.with(|t| *t.borrow_mut() = tokens);
            TOKEN_APPROVALS.with(|t| *t.borrow_mut() = token_approvals);
            OPERATOR_APPROVALS.with(|o| *o.borrow_mut() = operator_approvals);
            TOKEN_COUNTER.with(|c| *c.borrow_mut() = token_counter);
            COLLECTION_METADATA.with(|m| *m.borrow_mut() = collection_metadata);
            PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| *p.borrow_mut() = principal_to_youtube_proof);
            CHANNEL_TO_PRINCIPAL.with(|c| *c.borrow_mut() = channel_to_principal);
            VERIFIER_KEY.with(|v| *v.borrow_mut() = verifier_key);
            VERIFIER_KEYS.with(|v| *v.borrow_mut() = verifier_keys);
            YOUTUBE_METRICS.with(|m| *m.borrow_mut() = youtube_metrics);
            
            ic_cdk::println!("Successfully restored state from new format");
        },
        Err(_) => {
            // Fall back to old format
            match ic_cdk::storage::stable_restore::<((
                HashMap<TokenId, TokenMetadata>,
                HashMap<TokenId, Principal>,
                HashMap<(Principal, Principal), bool>,
                TokenId,
                CollectionMetadata,
                HashMap<Principal, ZkProofData>,
                HashMap<String, Principal>,
                Option<Vec<u8>>
            ),)>() {
                Ok((state,)) => {
                    let (
                        tokens, 
                        token_approvals, 
                        operator_approvals, 
                        token_counter, 
                        collection_metadata,
                        principal_to_youtube_proof,
                        channel_to_principal,
                        verifier_key
                    ) = state;
                    
                    // Restore old state
                    TOKENS.with(|t| *t.borrow_mut() = tokens);
                    TOKEN_APPROVALS.with(|t| *t.borrow_mut() = token_approvals);
                    OPERATOR_APPROVALS.with(|o| *o.borrow_mut() = operator_approvals);
                    TOKEN_COUNTER.with(|c| *c.borrow_mut() = token_counter);
                    COLLECTION_METADATA.with(|m| *m.borrow_mut() = collection_metadata);
                    PRINCIPAL_TO_YOUTUBE_PROOF.with(|p| *p.borrow_mut() = principal_to_youtube_proof);
                    CHANNEL_TO_PRINCIPAL.with(|c| *c.borrow_mut() = channel_to_principal);
                    
                  
                    let verifier_key_clone = verifier_key.clone();
                    VERIFIER_KEY.with(|v| *v.borrow_mut() = verifier_key);
                    
                  
                    if let Some(key) = verifier_key_clone {
                       
                        VERIFIER_KEYS.with(|v| {
                            v.borrow_mut().insert(ProofType::ChannelOwnership, key);
                        });
                    }
                    
                    ic_cdk::println!("Successfully restored state from old format");
                },
                Err(e) => {
                    ic_cdk::println!("No stable storage found or error restoring: {:?}", e);
                }
            }
        }
    }
    
   
    ic_cdk::println!("NFT Registry restored with YouTube ZK proof verifier");
}
ic_cdk::export_candid!();

