use ic_cdk::api::{msg_caller, time};
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;

type StreamId = u64;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Stream {
    pub stream_id: StreamId,
    pub recipient: Principal,
    pub total_amount: u64,
    pub amount_per_second: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub claimed_amount: u64,
    pub campaign_id: u64,
    pub vault_canister: Principal,
    pub is_active: bool,
    pub stream_type: StreamType,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum StreamType {
    Linear,      // Uniform distribution over time
    Cliff,       // All at once after cliff period
    Exponential, // Decreasing rate over time
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ClaimResult {
    pub stream_id: StreamId,
    pub claimed_amount: u64,
    pub remaining_amount: u64,
    pub next_claim_time: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct StreamStats {
    pub total_streams: u64,
    pub active_streams: u64,
    pub total_volume: u64,
    pub claimed_volume: u64,
}

thread_local! {
    static STREAMS: RefCell<HashMap<StreamId, Stream>> = RefCell::new(HashMap::new());
    static USER_STREAMS: RefCell<HashMap<Principal, Vec<StreamId>>> = RefCell::new(HashMap::new());
    static STREAM_COUNTER: RefCell<StreamId> = RefCell::new(0);
}

#[init]
fn init() {
    ic_cdk::println!("BeamFi Stream canister initialized");
}

#[update]
fn create_stream(
    recipient: Principal,
    total_amount: u64,
    duration_seconds: u64,
    campaign_id: u64,
    vault_canister: Principal,
    stream_type: StreamType,
) -> Result<StreamId, String> {
    let _caller = msg_caller();
    
    if total_amount == 0 {
        return Err("Stream amount must be greater than 0".to_string());
    }
    
    if duration_seconds == 0 {
        return Err("Stream duration must be greater than 0".to_string());
    }
    
    let stream_id = STREAM_COUNTER.with(|counter| {
        let current = *counter.borrow();
        let next = current + 1;
        *counter.borrow_mut() = next;
        next
    });
    
    let start_time = time();
    let end_time = start_time + (duration_seconds * 1_000_000_000); // Convert to nanoseconds
    
    let amount_per_second = match stream_type {
        StreamType::Linear => total_amount / duration_seconds,
        StreamType::Cliff => 0, // All at end
        StreamType::Exponential => total_amount / duration_seconds, // Initial rate
    };
    
    let stream = Stream {
        stream_id,
        recipient,
        total_amount,
        amount_per_second,
        start_time,
        end_time,
        claimed_amount: 0,
        campaign_id,
        vault_canister,
        is_active: true,
        stream_type,
    };
    
    // Store stream
    STREAMS.with(|streams| {
        streams.borrow_mut().insert(stream_id, stream);
    });
    
    // Update user streams index
    USER_STREAMS.with(|user_streams| {
        let mut streams = user_streams.borrow().get(&recipient).cloned().unwrap_or_default();
        streams.push(stream_id);
        user_streams.borrow_mut().insert(recipient, streams);
    });
    
    ic_cdk::println!("Stream {} created for {} (amount: {})", stream_id, recipient.to_text(), total_amount);
    
    Ok(stream_id)
}

#[update]
fn create_streams(payouts: Vec<(Principal, u64)>) -> Result<Vec<StreamId>, String> {
    let caller = msg_caller();
    let mut stream_ids = Vec::new();
    
    for (recipient, amount) in payouts {
        let stream_id = create_stream(
            recipient,
            amount,
            2592000, // 30 days default duration
            0, // TODO: Get campaign_id from caller context
            caller, // Assume caller is vault canister
            StreamType::Linear,
        )?;
        stream_ids.push(stream_id);
    }
    
    Ok(stream_ids)
}

#[update]
async fn claim_stream(stream_id: StreamId) -> Result<ClaimResult, String> {
    let caller = msg_caller();
    let current_time = time();
    
    // First, get and validate the stream
    let stream_data = STREAMS.with(|streams| {
        let mut borrowed = streams.borrow_mut();
        if let Some(stream) = borrowed.get_mut(&stream_id) {
            if stream.recipient != caller {
                return Err("Only stream recipient can claim".to_string());
            }
            
            if !stream.is_active {
                return Err("Stream is not active".to_string());
            }
            
            if current_time < stream.start_time {
                return Err("Stream has not started yet".to_string());
            }
            
            let claimable = calculate_claimable_amount(&stream, current_time);
            
            if claimable == 0 {
                return Err("No claimable amount available".to_string());
            }
            
            // Update claimed amount
            stream.claimed_amount += claimable;
            
            // Check if stream is complete
            if stream.claimed_amount >= stream.total_amount || current_time >= stream.end_time {
                stream.is_active = false;
            }
            
            let remaining = stream.total_amount - stream.claimed_amount;
            let next_claim_time = if stream.is_active {
                current_time + 1_000_000_000 // 1 second from now
            } else {
                0
            };
            
            ic_cdk::println!("Claimed {} from stream {} for {}", claimable, stream_id, caller.to_text());
            
            
            // Can't use await within STREAMS.with, so we'll just prepare the data
            return Ok((stream.vault_canister, stream.recipient.clone(), claimable, remaining, next_claim_time));
        }
        
        // Return an error if stream not found
        Err("Stream not found".to_string())
    });
    
    // Extract data from our stream
    let (vault_canister, recipient, claimable_amount, remaining, next_claim_time) = stream_data?;
    
    // Now we can use await outside the closure - using the deprecated API but we can fix this later
    let res: Result<(), _> = ic_cdk::api::call::call(
        vault_canister, 
        "transfer",
        (recipient, claimable_amount)
    ).await;
    
    res.map_err(|e| format!("Transfer failed: {:?}", e))?;
    
    // Return the result
    Ok(ClaimResult {
        stream_id,
        claimed_amount: claimable_amount,
        remaining_amount: remaining,
        next_claim_time,
    })
}

fn calculate_claimable_amount(stream: &Stream, current_time: u64) -> u64 {
    if current_time < stream.start_time {
        return 0;
    }
    
    let elapsed_time = if current_time >= stream.end_time {
        stream.end_time - stream.start_time
    } else {
        current_time - stream.start_time
    };
    
    let elapsed_seconds = elapsed_time / 1_000_000_000; // Convert from nanoseconds
    
    let total_vested = match stream.stream_type {
        StreamType::Linear => {
            let total_duration = (stream.end_time - stream.start_time) / 1_000_000_000;
            if elapsed_seconds >= total_duration {
                stream.total_amount
            } else {
                (stream.total_amount * elapsed_seconds) / total_duration
            }
        }
        StreamType::Cliff => {
            if current_time >= stream.end_time {
                stream.total_amount
            } else {
                0
            }
        }
        StreamType::Exponential => {
            // Exponential decay formula
            let total_duration = (stream.end_time - stream.start_time) / 1_000_000_000;
            let progress = elapsed_seconds as f64 / total_duration as f64;
            let vested_ratio = 1.0 - (-2.0 * progress).exp(); // Exponential curve
            (stream.total_amount as f64 * vested_ratio) as u64
        }
    };
    
    // Return claimable amount (total vested minus already claimed)
    if total_vested > stream.claimed_amount {
        total_vested - stream.claimed_amount
    } else {
        0
    }
}

#[query]
fn get_stream(stream_id: StreamId) -> Option<Stream> {
    STREAMS.with(|streams| streams.borrow().get(&stream_id).cloned())
}

#[query]
fn get_user_streams(user: Principal) -> Vec<Stream> {
    USER_STREAMS.with(|user_streams| {
        if let Some(stream_ids) = user_streams.borrow().get(&user).cloned() {
            STREAMS.with(|streams| {
                stream_ids.iter()
                    .filter_map(|&id| streams.borrow().get(&id).cloned())
                    .collect()
            })
        } else {
            Vec::new()
        }
    })
}

#[query]
fn get_claimable_amount(stream_id: StreamId) -> u64 {
    let current_time = time();
    
    STREAMS.with(|streams| {
        if let Some(stream) = streams.borrow().get(&stream_id) {
            calculate_claimable_amount(&stream, current_time)
        } else {
            0
        }
    })
}

#[query]
fn get_stream_stats() -> StreamStats {
    STREAMS.with(|streams| {
        let all_streams: Vec<Stream> = streams.borrow().iter().map(|(_, stream)| stream.clone()).collect();
        
        let total_streams = all_streams.len() as u64;
        let active_streams = all_streams.iter().filter(|s| s.is_active).count() as u64;
        let total_volume = all_streams.iter().map(|s| s.total_amount).sum();
        let claimed_volume = all_streams.iter().map(|s| s.claimed_amount).sum();
        
        StreamStats {
            total_streams,
            active_streams,
            total_volume,
            claimed_volume,
        }
    })
}

#[update]
fn pause_stream(stream_id: StreamId) -> Result<(), String> {
    let caller = msg_caller();
    
    STREAMS.with(|streams| {
        let mut borrowed = streams.borrow_mut();
        if let Some(stream) = borrowed.get_mut(&stream_id) {
            // Only vault canister or recipient can pause
            if stream.vault_canister != caller && stream.recipient != caller {
                return Err("Unauthorized to pause stream".to_string());
            }
            
            stream.is_active = false;
            Ok(())
        } else {
            Err("Stream not found".to_string())
        }
    })
}

#[update]
fn resume_stream(stream_id: StreamId) -> Result<(), String> {
    let caller = msg_caller();
    
    STREAMS.with(|streams| {
        let mut borrowed = streams.borrow_mut();
        if let Some(stream) = borrowed.get_mut(&stream_id) {
            // Only vault canister can resume
            if stream.vault_canister != caller {
                return Err("Only vault canister can resume stream".to_string());
            }
            
            if stream.claimed_amount < stream.total_amount {
                stream.is_active = true;
            }
            Ok(())
        } else {
            Err("Stream not found".to_string())
        }
    })
}
ic_cdk::export_candid!();