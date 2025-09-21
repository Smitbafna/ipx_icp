use ic_cdk::api::{msg_caller, time};
use ic_cdk::api::management_canister::main::{CreateCanisterArgument, CanisterSettings, CanisterId};
use ic_cdk::api::call::call;
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CampaignMetadata {
    pub creator: Principal,
    pub title: String,
    pub description: String,
    pub funding_goal: u64,
    pub revenue_share_percentage: u8, // 1-100
    pub oracle_endpoints: Vec<String>,
    pub vault_canister_id: Option<Principal>,
    pub created_at: u64,
    pub status: CampaignStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum CampaignStatus {
    Draft,
    Active,
    Funded,
    Completed,
    Cancelled,
}

thread_local! {
    static CAMPAIGN_COUNTER: RefCell<u64> = RefCell::new(0);
    static CAMPAIGNS: RefCell<HashMap<u64, CampaignMetadata>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Campaign Factory initialized");
}

#[update]
async fn create_campaign(
    title: String,
    description: String,
    funding_goal: u64,
    revenue_share_percentage: u8,
    oracle_endpoints: Vec<String>,
) -> Result<u64, String> {
    let caller = msg_caller();
    
    if revenue_share_percentage == 0 || revenue_share_percentage > 100 {
        return Err("Revenue share must be between 1-100%".to_string());
    }
    
    // Generate unique campaign ID
    let campaign_id = CAMPAIGN_COUNTER.with(|counter| {
        let current = *counter.borrow();
        let next = current + 1;
        *counter.borrow_mut() = next;
        next
    });
    
    // Create campaign metadata
    let metadata = CampaignMetadata {
        creator: caller,
        title: title.clone(),
        description,
        funding_goal,
        revenue_share_percentage,
        oracle_endpoints,
        vault_canister_id: None,
        created_at: time(),
        status: CampaignStatus::Draft,
    };
    
    // Store campaign
    CAMPAIGNS.with(|campaigns| {
        campaigns.borrow_mut().insert(campaign_id, metadata.clone());
    });
    
    // Create vault canister for this campaign
    match create_vault_canister(campaign_id, metadata).await {
        Ok(vault_id) => {
            // Update campaign with vault canister ID
            CAMPAIGNS.with(|campaigns| {
                if let Some(mut campaign) = campaigns.borrow().get(&campaign_id).cloned() {
                    campaign.vault_canister_id = Some(vault_id);
                    campaign.status = CampaignStatus::Active;
                    campaigns.borrow_mut().insert(campaign_id, campaign);
                }
            });
            
            ic_cdk::println!("Campaign {} created with vault {}", campaign_id, vault_id.to_text());
            Ok(campaign_id)
        }
        Err(e) => {
            // Remove campaign if vault creation failed
            CAMPAIGNS.with(|campaigns| {
                campaigns.borrow_mut().remove(&campaign_id);
            });
            Err(format!("Failed to create vault canister: {}", e))
        }
    }
}

async fn create_vault_canister(
    _campaign_id: u64,
    _metadata: CampaignMetadata,
) -> Result<Principal, String> {
    
    // Set up canister settings (optional, can be customized)
    let settings = CanisterSettings {
        controllers: Some(vec![ic_cdk::api::id()]),
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: None,
        reserved_cycles_limit: None,
        wasm_memory_limit: None,
        log_visibility: None,
    };

    let arg = CreateCanisterArgument {
        settings: Some(settings),
    };

    // Create the canister
    match ic_cdk::api::management_canister::main::create_canister(arg, 0).await {
        Ok((canister_id_record,)) => {
            Ok(canister_id_record.canister_id)
        }
        Err(e) => {
            Err(format!("Canister creation failed: {:?}", e))
        }
    }
}

#[query]
fn get_campaign(campaign_id: u64) -> Option<CampaignMetadata> {
    CAMPAIGNS.with(|campaigns| campaigns.borrow().get(&campaign_id).cloned())
}

#[query]
fn get_campaigns_by_creator(creator: Principal) -> Vec<(u64, CampaignMetadata)> {
    CAMPAIGNS.with(|campaigns| {
        campaigns
            .borrow()
            .iter()
            .filter(|(_, metadata)| metadata.creator == creator)
            .map(|(k, v)| (*k, v.clone()))
            .collect()
    })
}

#[query]
fn get_all_campaigns() -> Vec<(u64, CampaignMetadata)> {
    CAMPAIGNS.with(|campaigns| {
        campaigns
            .borrow()
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect()
    })
}

#[query]
fn get_active_campaigns() -> Vec<(u64, CampaignMetadata)> {
    CAMPAIGNS.with(|campaigns| {
        campaigns
            .borrow()
            .iter()
            .filter(|(_, metadata)| metadata.status == CampaignStatus::Active)
            .map(|(k, v)| (*k, v.clone()))
            .collect()
    })
}

#[update]
fn update_campaign_status(campaign_id: u64, status: CampaignStatus) -> Result<(), String> {
    let caller = msg_caller();
    
    CAMPAIGNS.with(|campaigns| {
        if let Some(mut campaign) = campaigns.borrow().get(&campaign_id).cloned() {
            if campaign.creator != caller {
                return Err("Only campaign creator can update status".to_string());
            }
            
            campaign.status = status;
            campaigns.borrow_mut().insert(campaign_id, campaign);
            Ok(())
        } else {
            Err("Campaign not found".to_string())
        }
    })
}
ic_cdk::export_candid!();