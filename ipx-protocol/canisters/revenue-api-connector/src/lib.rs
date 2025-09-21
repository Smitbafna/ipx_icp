use ic_cdk::api::{msg_caller, time, canister_self};
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use ic_cdk::api::call::{call, CallResult};
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpMethod, HttpHeader, HttpResponse, TransformArgs,
    http_request,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct OracleConfig {
    pub campaign_id: u64,
    pub vault_canister: Principal,
    pub endpoints: Vec<ApiEndpoint>,
    pub update_frequency: u64, // seconds
    pub last_update: u64,
    pub is_active: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiEndpoint {
    pub platform: String,
    pub url: String,
    pub auth_header: Option<String>,
    pub data_path: String, // JSON path to extract revenue data
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevenueData {
    pub campaign_id: u64,
    pub platform: String,
    pub amount: u64,
    pub currency: String,
    pub timestamp: u64,
    pub raw_data: String,
    pub verified: bool,
}

thread_local! {
    static ORACLE_CONFIGS: RefCell<HashMap<u64, OracleConfig>> = RefCell::new(HashMap::new());
    static REVENUE_HISTORY: RefCell<HashMap<(u64, u64), RevenueData>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Oracle Aggregator initialized");
}

#[update]
async fn register_campaign_oracle(
    campaign_id: u64,
    vault_canister: Principal,
    endpoints: Vec<ApiEndpoint>,
    update_frequency: u64,
) -> Result<(), String> {
    let caller = msg_caller();
    
    // Authorization check: only vault canister or campaign creator can register
    if caller != vault_canister {
        // Query vault canister for campaign creator
        let creator_result: Result<(Principal,), _> = ic_cdk::api::call::call(
            vault_canister,
            "get_campaign_creator",
            (campaign_id,)
        ).await;
        match creator_result {
            Ok((creator,)) => {
                if caller != creator {
                    return Err("Unauthorized: Only vault or campaign creator can register oracle".to_string());
                }
            }
            Err(_) => {
                return Err("Failed to fetch campaign creator from vault canister".to_string());
            }
        }
    }
    
    let config = OracleConfig {
        campaign_id,
        vault_canister,
        endpoints,
        update_frequency,
        last_update: 0,
        is_active: true,
    };
    
    ORACLE_CONFIGS.with(|configs| {
        configs.borrow_mut().insert(campaign_id, config.clone());
    });
    
    ic_cdk::println!("Oracle registered for campaign {}", campaign_id);
    Ok(())
}

#[update]
async fn fetch_revenue_data(campaign_id: u64) -> Result<Vec<RevenueData>, String> {
    let config = ORACLE_CONFIGS.with(|configs| configs.borrow().get(&campaign_id).cloned());
    
    match config {
        Some(mut config) => {
            if !config.is_active {
                return Err("Oracle is not active for this campaign".to_string());
            }
            
            let mut results = Vec::new();
            
            for endpoint in &config.endpoints {
                match fetch_from_endpoint(campaign_id, endpoint).await {
                    Ok(data) => {
                        results.push(data.clone());
                        
                        // Store in history
                        let key = (campaign_id, data.timestamp);
                        REVENUE_HISTORY.with(|history| {
                            history.borrow_mut().insert(key, data);
                        });
                    }
                    Err(e) => {
                        ic_cdk::println!("Failed to fetch from {}: {}", endpoint.platform, e);
                    }
                }
            }
            
            // Update last fetch time
            config.last_update = time();
            ORACLE_CONFIGS.with(|configs| {
                configs.borrow_mut().insert(campaign_id, config.clone());
            });
            
            // Send updates to vault canister
            if !results.is_empty() {
                let total_revenue: u64 = results.iter().map(|r| r.amount).sum();
                let _ = update_vault_revenue(config.vault_canister, total_revenue).await;
            }
            
            Ok(results)
        }
        None => Err("Oracle not configured for this campaign".to_string()),
    }
}

async fn fetch_from_endpoint(campaign_id: u64, endpoint: &ApiEndpoint) -> Result<RevenueData, String> {
    let mut headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
    ];
    
    if let Some(auth) = &endpoint.auth_header {
        headers.push(HttpHeader {
            name: "Authorization".to_string(),
            value: auth.clone(),
        });
    }
    
    let request = CanisterHttpRequestArgument {
        url: endpoint.url.clone(),
        max_response_bytes: Some(1024 * 10), // 10KB max
        method: HttpMethod::GET,
        headers,
        body: None,
        transform: None,
    };
    
    match http_request(request, 25_000_000_000).await {
        Ok((response,)) => {
            if response.status == 200u8 {
                let body_str = String::from_utf8(response.body)
                    .map_err(|_| "Invalid UTF-8 response")?;
                
                parse_revenue_from_response(campaign_id, endpoint, &body_str)
            } else {
                Err(format!("HTTP error: {}", response.status))
            }
        }
        Err((code, msg)) => Err(format!("Request failed: {:?} - {}", code, msg)),
    }
}

fn parse_revenue_from_response(
    campaign_id: u64,
    endpoint: &ApiEndpoint,
    response: &str,
) -> Result<RevenueData, String> {
    let json: Value = serde_json::from_str(response)
        .map_err(|_| "Invalid JSON response")?;
    
    // Extract revenue based on platform-specific data paths
    let amount = match endpoint.platform.as_str() {
        "youtube" => extract_youtube_revenue(&json)?,
        "spotify" => extract_spotify_revenue(&json)?,
        "substack" => extract_substack_revenue(&json)?,
        _ => return Err("Unsupported platform".to_string()),
    };
    
    Ok(RevenueData {
        campaign_id,
        platform: endpoint.platform.clone(),
        amount,
        currency: "USD".to_string(), // Default to USD, could be configurable
        timestamp: time(),
        raw_data: response.to_string(),
        verified: true, // TODO: Add verification logic
    })
}

fn extract_youtube_revenue(json: &Value) -> Result<u64, String> {
    // YouTube Analytics API response parsing
    json.pointer("/reports/0/data/totals/0/values/0")
        .and_then(|v| v.as_str())
        .and_then(|s| s.parse::<f64>().ok())
        .map(|f| (f * 100.0) as u64) // Convert to cents
        .ok_or_else(|| "Failed to extract YouTube revenue".to_string())
}

fn extract_spotify_revenue(json: &Value) -> Result<u64, String> {
    // Spotify for Artists API response parsing
    json.pointer("/revenue/total")
        .and_then(|v| v.as_f64())
        .map(|f| (f * 100.0) as u64) // Convert to cents
        .ok_or_else(|| "Failed to extract Spotify revenue".to_string())
}

fn extract_substack_revenue(json: &Value) -> Result<u64, String> {
    // Substack API response parsing
    json.pointer("/stats/revenue/total")
        .and_then(|v| v.as_f64())
        .map(|f| (f * 100.0) as u64) // Convert to cents
        .ok_or_else(|| "Failed to extract Substack revenue".to_string())
}

async fn update_vault_revenue(vault_canister: Principal, amount: u64) -> Result<(), String> {
    let result: CallResult<(Result<(), String>,)> = call(
        vault_canister,
        "update_revenue",
        (amount, "oracle_aggregated".to_string(), true),
    ).await;
    
    match result {
        Ok((Ok(()),)) => Ok(()),
        Ok((Err(e),)) => Err(e),
        Err(e) => Err(format!("Failed to call vault: {:?}", e)),
    }
}

#[update]
fn transform_response(args: TransformArgs) -> HttpResponse {
   
    HttpResponse {
        status: candid::Nat::from(200u8),
        headers: args.response.headers.clone(),
        body: args.response.body.clone(),
    }
}

#[query]
fn get_oracle_config(campaign_id: u64) -> Option<OracleConfig> {
    ORACLE_CONFIGS.with(|configs| configs.borrow().get(&campaign_id).cloned())
}

#[query]
fn get_revenue_history(campaign_id: u64) -> Vec<RevenueData> {
    REVENUE_HISTORY.with(|history| {
        history.borrow().iter()
            .filter(|((cid, _), _)| *cid == campaign_id)
            .map(|(_, data)| data.clone())
            .collect()
    })
}

#[update]
fn deactivate_oracle(campaign_id: u64) -> Result<(), String> {
    ORACLE_CONFIGS.with(|configs| {
        if let Some(mut config) = configs.borrow().get(&campaign_id).cloned() {
            config.is_active = false;
            configs.borrow_mut().insert(campaign_id, config);
            Ok(())
        } else {
            Err("Oracle config not found".to_string())
        }
    })
    
}

ic_cdk::export_candid!();
