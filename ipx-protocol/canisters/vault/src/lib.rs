use ic_cdk::api::{msg_caller, time, canister_self};
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use ic_cdk::api::call::{call, CallResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cmp;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VaultState {
    pub campaign_id: u64,
    pub creator: Principal,
    pub title: String,
    pub funding_goal: u64,
    pub current_funding: u64,
    pub revenue_share_percentage: u8,
    pub total_revenue: u64,
    pub oracle_endpoints: Vec<String>,
    pub nft_registry_canister: Option<Principal>,
    pub stream_canister: Option<Principal>,
    pub oracle_canister: Option<Principal>,
    pub backers: HashMap<Principal, BackerInfo>,
    pub revenue_history: Vec<RevenueUpdate>,
    pub created_at: u64,
    // Insurance pool related fields
    pub insurance_pool_balance: u64,
    pub insurance_fee_percentage: u8,
    pub insurance_coverage_ratio: u8,  // Percentage of investment covered by insurance
    pub insurance_claims: Vec<InsuranceClaim>,
    pub slashing_conditions: SlashingConditions,
    pub slashed_creators: Vec<SlashEvent>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BackerInfo {
    pub amount_invested: u64,
    pub nft_token_id: Option<u64>,
    pub share_percentage: f64,
    pub total_claimed: u64,
    pub investment_timestamp: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevenueUpdate {
    pub amount: u64,
    pub source: String,
    pub timestamp: u64,
    pub oracle_verification: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InvestmentResult {
    pub success: bool,
    pub nft_token_id: Option<u64>,
    pub share_percentage: f64,
    pub message: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
    Paid
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InsuranceClaim {
    pub claim_id: u64,
    pub claimer: Principal,
    pub amount: u64,
    pub reason: String,
    pub evidence: Vec<String>,
    pub status: ClaimStatus,
    pub filed_at: u64,
    pub resolved_at: Option<u64>,
    pub approver: Option<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SlashingConditions {
    pub missed_revenue_reports_threshold: u8,
    pub revenue_decline_threshold_percentage: u8,
    pub minimum_active_period_days: u64,
    pub governance_votes_required: u8,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum SlashReason {
    MissedRevenueReports,
    RevenueFraud,
    ProjectAbandonment,
    GovernanceDecision,
    Other(String),
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SlashEvent {
    pub creator: Principal,
    pub campaign_id: u64,
    pub reason: SlashReason,
    pub amount_slashed: u64,
    pub beneficiaries: Vec<Principal>,
    pub executed_at: u64,
    pub approved_by: Vec<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CampaignMetadata {
    pub creator: Principal,
    pub title: String,
    pub description: String,
    pub funding_goal: u64,
    pub revenue_share_percentage: u8,
    pub oracle_endpoints: Vec<String>,
}

thread_local! {
    static MEMORY_MANAGER: MemoryManager<DefaultMemoryImpl> = MemoryManager::init(DefaultMemoryImpl::default());
    
    static VAULT_STATE: std::cell::RefCell<Option<VaultState>> = std::cell::RefCell::new(None);
}

#[init]
fn init() {
    // Initialize with default state - can be configured later via update calls
    let vault_state = VaultState {
        campaign_id: 0,
        creator: Principal::anonymous(),
        title: "Default Vault".to_string(),
        funding_goal: 1000000, // 1M default goal
        current_funding: 0,
        revenue_share_percentage: 10, // Default 10%
        total_revenue: 0,
        oracle_endpoints: Vec::new(), // Empty by default
        nft_registry_canister: None,
        stream_canister: None,
        oracle_canister: None,
        backers: HashMap::new(),
        revenue_history: Vec::new(),
        created_at: time(),
        // Insurance pool defaults
        insurance_pool_balance: 0,
        insurance_fee_percentage: 2, // Default 2% insurance fee
        insurance_coverage_ratio: 80, // Default 80% coverage of investment
        insurance_claims: Vec::new(),
        slashing_conditions: SlashingConditions {
            missed_revenue_reports_threshold: 3, // 3 missed reports
            revenue_decline_threshold_percentage: 70, // 70% decline triggers review
            minimum_active_period_days: 30, // Must be active for 30 days
            governance_votes_required: 51, // 51% votes required for slashing
        },
        slashed_creators: Vec::new(),
    };
    
    VAULT_STATE.with(|state| {
        *state.borrow_mut() = Some(vault_state);
    });
    
    ic_cdk::println!("Vault initialized with default settings including insurance pool");
}

#[update]
async fn invest(amount: u64) -> InvestmentResult {
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
           
            if state.current_funding >= state.funding_goal {
                return InvestmentResult {
                    success: false,
                    nft_token_id: None,
                    share_percentage: 0.0,
                    message: "Campaign already fully funded".to_string(),
                };
            }
           
            let remaining_funding = state.funding_goal - state.current_funding;
            let actual_investment = amount.min(remaining_funding);
            
            // Calculate insurance fee
            let insurance_fee = (actual_investment * state.insurance_fee_percentage as u64) / 100;
            let investment_after_fee = actual_investment - insurance_fee;
            
            // Add to insurance pool
            state.insurance_pool_balance += insurance_fee;
            
            // Calculate share percentage based on investment after fee
            let share_percentage = (investment_after_fee as f64 / state.funding_goal as f64) * 100.0;
            
            // Update total funding with investment after fee
            state.current_funding += investment_after_fee;
            
            let backer_info = BackerInfo {
                amount_invested: actual_investment, // Track full amount including insurance fee
                nft_token_id: None,
                share_percentage,
                total_claimed: 0,
                investment_timestamp: time(),
            };
            
            state.backers.insert(caller, backer_info.clone());
            
            InvestmentResult {
                success: true,
                nft_token_id: None, 
                share_percentage,
                message: format!(
                    "Investment successful: {} contributed ({} to campaign, {} to insurance pool)", 
                    actual_investment, 
                    investment_after_fee, 
                    insurance_fee
                ),
            }
        } else {
            InvestmentResult {
                success: false,
                nft_token_id: None,
                share_percentage: 0.0,
                message: "Vault not initialized".to_string(),
            }
        }
    })
}

#[update]
async fn mint_nft_for_backer(backer: Principal) -> Result<u64, String> {
   
    let backer_info = VAULT_STATE.with(|state_ref| {
        let state_opt = state_ref.borrow();
        if let Some(ref state) = *state_opt {
            state.backers.get(&backer).cloned()
        } else {
            None
        }
    });
    
    if let Some(info) = backer_info {
        
        if let Some(nft_registry) = get_nft_registry_canister() {
            let metadata = format!(
                "{{\"campaign_id\":{},\"investment\":{},\"share\":{:.2}}}",
                get_campaign_id(),
                info.amount_invested,
                info.share_percentage
            );
            
            let result: CallResult<(Result<u64, String>,)> = call(
                nft_registry,
                "mint",
                (backer, metadata),
            ).await;
            
            match result {
                Ok((Ok(token_id),)) => {
            
                    VAULT_STATE.with(|state_ref| {
                        let mut state_opt = state_ref.borrow_mut();
                        if let Some(ref mut state) = *state_opt {
                            if let Some(ref mut backer_info) = state.backers.get_mut(&backer) {
                                backer_info.nft_token_id = Some(token_id);
                            }
                        }
                    });
                    Ok(token_id)
                },
                Ok((Err(e),)) => Err(e),
                Err(e) => Err(format!("Failed to call NFT registry: {:?}", e)),
            }
        } else {
            Err("NFT registry not configured".to_string())
        }
    } else {
        Err("Backer not found".to_string())
    }
}

#[update]
fn update_revenue(amount: u64, source: String, verified: bool) -> Result<(), String> {
    
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            let source_clone = source.clone();
            
            let revenue_update = RevenueUpdate {
                amount,
                source,
                timestamp: time(),
                oracle_verification: verified,
            };
            
            state.total_revenue += amount;
            state.revenue_history.push(revenue_update);
            
            ic_cdk::println!("Revenue updated: {} from {}", amount, source_clone);
            Ok(())
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

#[update]
async fn distribute_payouts() -> Result<Vec<(Principal, u64)>, String> {
    let mut payouts = Vec::new();
    let mut creator_slashed = false;
    let mut creator_slash_percentage = 0;
    
    VAULT_STATE.with(|state_ref| {
        let state_opt = state_ref.borrow();
        if let Some(ref state) = *state_opt {
            // Check if creator has been slashed
            if !state.slashed_creators.is_empty() {
                creator_slashed = true;
               
                creator_slash_percentage = 50;
            }
            
            // Calculate the investor share from revenue
            let mut investor_share = (state.total_revenue * state.revenue_share_percentage as u64) / 100;
            
            // If creator was slashed, add that portion to investor share
            if creator_slashed {
                let creator_share = (state.total_revenue * (100 - state.revenue_share_percentage) as u64) / 100;
                let slashed_amount = (creator_share * creator_slash_percentage) / 100;
                investor_share += slashed_amount;
            }
            
            // Distribute to backers according to their share percentage
            for (backer, info) in &state.backers {
                let backer_share = (investor_share as f64 * info.share_percentage / 100.0) as u64;
                let claimable = backer_share - info.total_claimed;
                
                if claimable > 0 {
                    payouts.push((*backer, claimable));
                }
            }
            
            // If we have any approved insurance claims that haven't been paid yet, add those
            for claim in &state.insurance_claims {
                if matches!(claim.status, ClaimStatus::Approved) {
                    // Check if this backer is already getting a payout
                    let existing_payout = payouts.iter_mut()
                        .find(|(principal, _)| *principal == claim.claimer);
                    
                    if let Some((_, amount)) = existing_payout {
                        // Add to existing payout
                        *amount += claim.amount;
                    } else {
                        // Create new payout
                        payouts.push((claim.claimer, claim.amount));
                    }
                }
            }
        }
    });
    
    
    if let Some(stream_canister) = get_stream_canister() {
        let result: CallResult<(Result<(), String>,)> = call(
            stream_canister,
            "create_streams",
            (payouts.clone(),),
        ).await;
        
        match result {
            Ok((Ok(()),)) => {
                
                VAULT_STATE.with(|state_ref| {
                    let mut state_opt = state_ref.borrow_mut();
                    if let Some(ref mut state) = *state_opt {
                        for (backer, amount) in &payouts {
                            if let Some(ref mut info) = state.backers.get_mut(backer) {
                                info.total_claimed += amount;
                            }
                        }
                    }
                });
                Ok(payouts)
            },
            Ok((Err(e),)) => Err(e),
            Err(e) => Err(format!("Failed to create streams: {:?}", e)),
        }
    } else {
        Err("Stream canister not configured".to_string())
    }
}


fn get_campaign_id() -> u64 {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().map(|s| s.campaign_id).unwrap_or(0)
    })
}

fn get_nft_registry_canister() -> Option<Principal> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().and_then(|s| s.nft_registry_canister)
    })
}

fn get_stream_canister() -> Option<Principal> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().and_then(|s| s.stream_canister)
    })
}

#[query]
fn get_vault_state() -> Option<VaultState> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().clone()
    })
}

#[query]
fn get_backer_info(backer: Principal) -> Option<BackerInfo> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().and_then(|s| s.backers.get(&backer).cloned())
    })
}

#[query]
fn get_funding_progress() -> (u64, u64, f64) {
    VAULT_STATE.with(|state_ref| {
        if let Some(ref state) = *state_ref.borrow() {
            let percentage = (state.current_funding as f64 / state.funding_goal as f64) * 100.0;
            (state.current_funding, state.funding_goal, percentage)
        } else {
            (0, 0, 0.0)
        }
    })
}

// Insurance-related functions

#[query]
fn get_insurance_pool_info() -> (u64, u8, u8) {
    VAULT_STATE.with(|state_ref| {
        if let Some(ref state) = *state_ref.borrow() {
            (
                state.insurance_pool_balance,
                state.insurance_fee_percentage,
                state.insurance_coverage_ratio
            )
        } else {
            (0, 0, 0)
        }
    })
}

#[update]
fn file_insurance_claim(amount: u64, reason: String, evidence: Vec<String>) -> Result<u64, String> {
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            // Check if caller is a backer
            if let Some(backer_info) = state.backers.get(&caller) {
                // Calculate max claimable amount (coverage ratio * investment)
                let max_claimable = (backer_info.amount_invested * state.insurance_coverage_ratio as u64) / 100;
                
                if amount > max_claimable {
                    return Err(format!("Claim exceeds maximum coverage of {}", max_claimable));
                }
                
                // Check if there's enough in the insurance pool
                if amount > state.insurance_pool_balance {
                    return Err("Insufficient funds in insurance pool".to_string());
                }
                
                // Create claim
                let claim_id = state.insurance_claims.len() as u64;
                let claim = InsuranceClaim {
                    claim_id,
                    claimer: caller,
                    amount,
                    reason,
                    evidence,
                    status: ClaimStatus::Pending,
                    filed_at: time(),
                    resolved_at: None,
                    approver: None,
                };
                
                state.insurance_claims.push(claim);
                
                Ok(claim_id)
            } else {
                Err("Only backers can file insurance claims".to_string())
            }
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

#[update]
fn process_insurance_claim(claim_id: u64, approve: bool, notes: String) -> Result<(), String> {
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            // Check if caller is creator or has governance rights
            if state.creator != caller {
                return Err("Only creator or governance can process claims".to_string());
            }
            
            // Find the claim
            if let Some(claim) = state.insurance_claims.iter_mut().find(|c| c.claim_id == claim_id) {
                if matches!(claim.status, ClaimStatus::Pending) {
                    if approve {
                        // Make sure we have enough in the pool
                        if claim.amount > state.insurance_pool_balance {
                            return Err("Insufficient funds in insurance pool".to_string());
                        }
                        
                        // Update claim status
                        claim.status = ClaimStatus::Approved;
                        claim.resolved_at = Some(time());
                        claim.approver = Some(caller);
                        
                        // Reduce the insurance pool
                        state.insurance_pool_balance -= claim.amount;
                                                
                    } else {
                        // Reject the claim
                        claim.status = ClaimStatus::Rejected;
                        claim.resolved_at = Some(time());
                        claim.approver = Some(caller);
                    }
                    
                    Ok(())
                } else {
                    Err(format!("Claim is not pending. Current status: {:?}", claim.status))
                }
            } else {
                Err(format!("Claim with ID {} not found", claim_id))
            }
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

// Slashing-related functions

#[update]
fn propose_slashing(creator: Principal, reason: SlashReason, evidence: Vec<String>) -> Result<u64, String> {
    let caller = msg_caller();
    

    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            // Basic validation
            if creator != state.creator {
                return Err("Target is not the creator of this campaign".to_string());
            }
            
         
            let creator_share = state.total_revenue * (100 - state.revenue_share_percentage) as u64 / 100;
            let slash_amount = creator_share / 2;
            
            // Record slash event
            let slash_event = SlashEvent {
                creator,
                campaign_id: state.campaign_id,
                reason,
                amount_slashed: slash_amount,
                beneficiaries: state.backers.keys().cloned().collect(), // Distribute to all backers
                executed_at: time(),
                approved_by: vec![caller], 
            };
            
            state.slashed_creators.push(slash_event.clone());
            
            
            state.insurance_pool_balance += slash_amount;
            
            Ok(state.slashed_creators.len() as u64 - 1)
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

#[query]
fn get_slashing_conditions() -> SlashingConditions {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().map_or_else(
            || SlashingConditions {
                missed_revenue_reports_threshold: 0,
                revenue_decline_threshold_percentage: 0,
                minimum_active_period_days: 0,
                governance_votes_required: 0,
            },
            |s| s.slashing_conditions.clone()
        )
    })
}

#[query]
fn get_slash_events() -> Vec<SlashEvent> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().map_or_else(
            || Vec::new(),
            |s| s.slashed_creators.clone()
        )
    })
}

#[query]
fn get_insurance_claims(backer: Option<Principal>) -> Vec<InsuranceClaim> {
    VAULT_STATE.with(|state_ref| {
        if let Some(ref state) = *state_ref.borrow() {
            match backer {
                Some(principal) => state.insurance_claims.iter()
                    .filter(|claim| claim.claimer == principal)
                    .cloned()
                    .collect(),
                None => state.insurance_claims.clone(),
            }
        } else {
            Vec::new()
        }
    })
}

#[query]
fn get_insurance_claim(claim_id: u64) -> Option<InsuranceClaim> {
    VAULT_STATE.with(|state_ref| {
        state_ref.borrow().as_ref().and_then(|s| {
            s.insurance_claims.iter()
                .find(|c| c.claim_id == claim_id)
                .cloned()
        })
    })
}

#[update]
fn set_canister_refs(
    nft_registry: Option<Principal>,
    stream: Option<Principal>,
    oracle: Option<Principal>,
) -> Result<(), String> {
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            if state.creator != caller {
                return Err("Only creator can set canister references".to_string());
            }
            
            if let Some(nft) = nft_registry {
                state.nft_registry_canister = Some(nft);
            }
            if let Some(stream) = stream {
                state.stream_canister = Some(stream);
            }
            if let Some(oracle) = oracle {
                state.oracle_canister = Some(oracle);
            }
            
            Ok(())
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

#[update]
fn update_insurance_settings(
    fee_percentage: Option<u8>,
    coverage_ratio: Option<u8>,
    slashing_conditions: Option<SlashingConditions>
) -> Result<(), String> {
    let caller = msg_caller();
    
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            // Only creator or DAO governance can update these settings
            if state.creator != caller {
                return Err("Only creator or governance can update insurance settings".to_string());
            }
            
            // Update insurance fee percentage if provided
            if let Some(fee) = fee_percentage {
                if fee > 20 {
                    return Err("Insurance fee cannot exceed 20%".to_string());
                }
                state.insurance_fee_percentage = fee;
            }
            
            // Update coverage ratio if provided
            if let Some(ratio) = coverage_ratio {
                if ratio > 100 {
                    return Err("Coverage ratio cannot exceed 100%".to_string());
                }
                state.insurance_coverage_ratio = ratio;
            }
            
            // Update slashing conditions if provided
            if let Some(conditions) = slashing_conditions {
                state.slashing_conditions = conditions;
            }
            
            Ok(())
        } else {
            Err("Vault not initialized".to_string())
        }
    })
}

ic_cdk::export_candid!();