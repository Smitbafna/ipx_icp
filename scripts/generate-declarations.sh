#!/bin/bash
# Script to generate Candid declarations for the frontend

# Exit on error
set -e

# Navigate to project root
cd "$(dirname "$0")/.."

# DFX directory containing the Candid files
DFX_DIR="ipx-protocol/.dfx/local/canisters"

# Frontend src directory for declarations
FRONTEND_DIR="frontend/src/declarations"

# Function to generate declarations for a canister
generate_declarations() {
  CANISTER_NAME=$1
  OUTPUT_DIR=$2
  CANDID_FILE=$3
  
  echo "Generating declarations for $CANISTER_NAME..."
  
  # Create output directory if it doesn't exist
  mkdir -p "$OUTPUT_DIR"
  
  # Check if the Candid file exists
  if [ -f "$CANDID_FILE" ]; then
    # Use didc tool to generate TypeScript declarations
    didc bind -t ts "$CANDID_FILE" > "$OUTPUT_DIR/index.d.ts"
    
    # Extract just the IDL factory for JavaScript
    didc bind -t js "$CANDID_FILE" > "$OUTPUT_DIR/index.js"
    
    echo "Successfully generated declarations for $CANISTER_NAME"
  else
    echo "Warning: Candid file not found for $CANISTER_NAME at $CANDID_FILE"
    echo "Creating placeholder declarations..."
    
    # Create placeholder JavaScript file if Candid file is missing
    echo "// Placeholder IDL factory for $CANISTER_NAME - replace with actual declarations
export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    // Add service methods here based on the Candid interface
  });
};

export const init = ({ IDL }) => { return []; };" > "$OUTPUT_DIR/index.js"
    
    echo "Created placeholder declarations for $CANISTER_NAME"
  fi
}

# Generate declarations for each canister
generate_declarations "vault" "$FRONTEND_DIR/vault" "$DFX_DIR/vault/vault.did"
generate_declarations "ipx-stream" "$FRONTEND_DIR/ipx-stream" "$DFX_DIR/beamfi-stream/beamfi-stream.did" 
generate_declarations "campaign-factory" "$FRONTEND_DIR/campaign-factory" "$DFX_DIR/campaign-factory/campaign-factory.did"
generate_declarations "nft-registry" "$FRONTEND_DIR/nft-registry" "$DFX_DIR/nft-registry/nft-registry.did"
generate_declarations "ipx-dao" "$FRONTEND_DIR/ipx-dao" "$DFX_DIR/sns-dao/sns-dao.did"
generate_declarations "revenue-api-connector" "$FRONTEND_DIR/revenue-api-connector" "$DFX_DIR/oracle-aggregator/oracle-aggregator.did"

echo "All declarations generated successfully"
