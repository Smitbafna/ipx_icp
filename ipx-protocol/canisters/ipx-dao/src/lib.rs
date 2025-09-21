use ic_cdk::api::{msg_caller, time};
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ProposalType {
    ParameterChange,
    CodeUpgrade,
    Treasury,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ProposalData {
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub voting_period: u64, // Duration in nanoseconds
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Principal,
    pub data: ProposalData,
    pub votes_for: u64,
    pub votes_against: u64,
    pub created_at: u64,
    pub voting_deadline: u64,
    pub executed: bool,
    pub voters: Vec<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GovernanceStats {
    pub total_proposals: u64,
    pub active_proposals: u64,
    pub total_votes_cast: u64,
    pub treasury_balance: u64,
}

// Storage
thread_local! {
    static PROPOSALS: RefCell<HashMap<u64, Proposal>> = RefCell::new(HashMap::new());
    static PROPOSAL_COUNTER: RefCell<u64> = RefCell::new(0);
    static MEMBER_VOTES: RefCell<HashMap<Principal, u64>> = RefCell::new(HashMap::new()); // Voting power
    static TREASURY_BALANCE: RefCell<u64> = RefCell::new(1000000); // Initial treasury
    static READY_FOR_UPGRADE: RefCell<bool> = RefCell::new(false); // Flag for code upgrade
    static DEFAULT_VOTING_PERIOD: RefCell<u64> = RefCell::new(7 * 24 * 60 * 60 * 1_000_000_000); // 7 days in nanoseconds
}

#[init]
fn init() {

    let caller = msg_caller();
    MEMBER_VOTES.with(|votes| {
        votes.borrow_mut().insert(caller, 100);
    });
}

#[update]
fn create_proposal(data: ProposalData) -> Result<u64, String> {
    let caller = msg_caller();
    
    // Check if caller has voting power
    let has_voting_power = MEMBER_VOTES.with(|votes| {
        votes.borrow().get(&caller).unwrap_or(&0) > &0
    });
    
    if !has_voting_power {
        return Err("No voting power".to_string());
    }
    
    let proposal_id = PROPOSAL_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    });
    
    let current_time = time();
    let voting_deadline = current_time + data.voting_period;
    
    let proposal = Proposal {
        id: proposal_id,
        proposer: caller,
        data,
        votes_for: 0,
        votes_against: 0,
        created_at: current_time,
        voting_deadline,
        executed: false,
        voters: Vec::new(),
    };
    
    PROPOSALS.with(|proposals| {
        proposals.borrow_mut().insert(proposal_id, proposal);
    });
    
    Ok(proposal_id)
}

#[update]
fn vote(proposal_id: u64, support: bool) -> Result<String, String> {
    let caller = msg_caller();
    
    // Get voting power
    let voting_power = MEMBER_VOTES.with(|votes| {
        *votes.borrow().get(&caller).unwrap_or(&0)
    });
    
    if voting_power == 0 {
        return Err("No voting power".to_string());
    }
    
    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        
        if let Some(proposal) = proposals.get_mut(&proposal_id) {
            // Check if voting period is still active
            if time() > proposal.voting_deadline {
                return Err("Voting period has ended".to_string());
            }
            
            // Check if already voted
            if proposal.voters.contains(&caller) {
                return Err("Already voted".to_string());
            }
            
            // Cast vote
            if support {
                proposal.votes_for += voting_power;
            } else {
                proposal.votes_against += voting_power;
            }
            
            proposal.voters.push(caller);
            
            Ok("Vote cast successfully".to_string())
        } else {
            Err("Proposal not found".to_string())
        }
    })
}

#[update]
fn execute_proposal(proposal_id: u64) -> Result<String, String> {
    let current_time = time();
    
    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        
        if let Some(proposal) = proposals.get_mut(&proposal_id) {
            // Check if voting period has ended
            if current_time <= proposal.voting_deadline {
                return Err("Voting period still active".to_string());
            }
            
            // Check if already executed
            if proposal.executed {
                return Err("Proposal already executed".to_string());
            }
            
            // Check if proposal passed (simple majority)
            if proposal.votes_for > proposal.votes_against {
                proposal.executed = true;
                
                // Execute based on proposal type
                match proposal.data.proposal_type {
                    ProposalType::Treasury => {
                        // Distribute treasury funds
                        TREASURY_BALANCE.with(|balance| {
                            let mut balance = balance.borrow_mut();
                            if *balance >= 1000 {
                                *balance -= 1000; // Distribute 1000 tokens
                            }
                        });
                    },
                    ProposalType::ParameterChange => {
                      
                        // We'll store a global DEFAULT_VOTING_PERIOD
                        DEFAULT_VOTING_PERIOD.with(|period| {
                            let mut period = period.borrow_mut();
                            *period = proposal.data.voting_period;
                        });
                        ic_cdk::println!("Default voting period updated to {}", proposal.data.voting_period);
                    },
                    ProposalType::CodeUpgrade => {
                        // Mark proposal as ready for upgrade and log
                        READY_FOR_UPGRADE.with(|flag| {
                            *flag.borrow_mut() = true;
                        });
                        ic_cdk::println!("Code upgrade proposal executed. Upgrade flag set.");
                       
                    },
                }
                
                Ok("Proposal executed successfully".to_string())
            } else {
                Ok("Proposal failed to pass".to_string())
            }
        } else {
            Err("Proposal not found".to_string())
        }
    })
}

#[update]
fn grant_voting_power(member: Principal, power: u64) -> Result<String, String> {
    let caller = msg_caller();
    
    // Only allow existing members with high voting power to grant voting rights
    let caller_power = MEMBER_VOTES.with(|votes| {
        *votes.borrow().get(&caller).unwrap_or(&0)
    });
    
    if caller_power < 50 {
        return Err("Insufficient voting power to grant rights".to_string());
    }
    
    MEMBER_VOTES.with(|votes| {
        votes.borrow_mut().insert(member, power);
    });
    
    Ok("Voting power granted".to_string())
}

#[query]
fn get_proposal(proposal_id: u64) -> Option<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow().get(&proposal_id).cloned()
    })
}

#[query]
fn get_all_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow().values().cloned().collect()
    })
}

#[query]
fn get_active_proposals() -> Vec<Proposal> {
    let current_time = time();
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .values()
            .filter(|p| current_time <= p.voting_deadline && !p.executed)
            .cloned()
            .collect()
    })
}

#[query]
fn get_voting_power(member: Principal) -> u64 {
    MEMBER_VOTES.with(|votes| {
        *votes.borrow().get(&member).unwrap_or(&0)
    })
}

#[query]
fn get_governance_stats() -> GovernanceStats {
    let current_time = time();
    
    let (total_proposals, active_proposals, total_votes) = PROPOSALS.with(|proposals| {
        let proposals = proposals.borrow();
        let total = proposals.len() as u64;
        let active = proposals.values()
            .filter(|p| current_time <= p.voting_deadline && !p.executed)
            .count() as u64;
        let votes = proposals.values()
            .map(|p| p.votes_for + p.votes_against)
            .sum::<u64>();
        (total, active, votes)
    });
    
    let treasury_balance = TREASURY_BALANCE.with(|balance| *balance.borrow());
    
    GovernanceStats {
        total_proposals,
        active_proposals,
        total_votes_cast: total_votes,
        treasury_balance,
    }
}

// Export candid interface
ic_cdk::export_candid!();
