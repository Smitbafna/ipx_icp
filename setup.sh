#!/bin/bash

# IPX Protocol Quick Setup Script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}IPX Protocol Quick Setup${NC}"

# Check prerequisites exist
for cmd in node npm dfx rustc cargo candid-extractor; do
    if ! command -v $cmd >/dev/null 2>&1; then
        echo -e "${RED}Error: $cmd not found. Please install: Node.js 18+, npm, dfx, rust, cargo, candid-extractor${NC}"
        exit 1
    fi
done

echo -e "${GREEN}All dependencies found${NC}"

# Deploy IC Canisters
echo -e "${BLUE}� Deploying IC Canisters...${NC}"
cd ipx-protocol
dfx start --background --clean

# Build Rust canisters and extract .did files
echo -e "${GREEN}Building Rust canisters and extracting Candid interfaces...${NC}"
mkdir -p candid

# Build and extract for campaign-factory
echo -e "${GREEN}Building campaign-factory...${NC}"
cargo build --target wasm32-unknown-unknown --release --package campaign-factory
candid-extractor target/wasm32-unknown-unknown/release/campaign_factory.wasm > candid/factory.did

# Build and extract for vault
echo -e "${GREEN}Building vault...${NC}"
cargo build --target wasm32-unknown-unknown --release --package vault
candid-extractor target/wasm32-unknown-unknown/release/vault.wasm > candid/vault.did

# Build and extract for nft-registry
echo -e "${GREEN}Building nft-registry...${NC}"
cargo build --target wasm32-unknown-unknown --release --package nft-registry
candid-extractor target/wasm32-unknown-unknown/release/nft_registry.wasm > candid/nft-registry.did

# Build and extract for revenue-api-connector
echo -e "${GREEN}Building revenue-api-connector...${NC}"
cargo build --target wasm32-unknown-unknown --release --package revenue-api-connector
candid-extractor target/wasm32-unknown-unknown/release/revenue_api_connector.wasm > candid/revenue-api-connector.did

# Build and extract for ipx-stream
echo -e "${GREEN}Building ipx-stream...${NC}"
cargo build --target wasm32-unknown-unknown --release --package ipx-stream
candid-extractor target/wasm32-unknown-unknown/release/ipx_stream.wasm > candid/ipx-stream.did

# Build and extract for ipx-dao
echo -e "${GREEN}Building ipx-dao...${NC}"
cargo build --target wasm32-unknown-unknown --release --package ipx-dao
candid-extractor target/wasm32-unknown-unknown/release/ipx_dao.wasm > candid/ipx-dao.did

# Create, build and deploy canisters
echo -e "${GREEN}Creating and deploying canisters...${NC}"
dfx canister create --all
dfx build
dfx deploy

# Get canister IDs
VAULT_ID=$(dfx canister id vault)
CAMPAIGN_ID=$(dfx canister id campaign-factory)
NFT_ID=$(dfx canister id nft-registry)
IPX_STREAM_ID=$(dfx canister id ipx-stream)
IPX_DAO_ID=$(dfx canister id ipx-dao)
REVENUE_API_CONNECTOR_ID=$(dfx canister id revenue-api-connector)

echo -e "${GREEN}Canisters deployed${NC}"
cd ..

# Setup Frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend
npm install

# Create environment config
cat > .env.local << EOF
NEXT_PUBLIC_VAULT_CANISTER_ID=$VAULT_ID
NEXT_PUBLIC_CAMPAIGN_FACTORY_CANISTER_ID=$CAMPAIGN_ID
NEXT_PUBLIC_NFT_REGISTRY_CANISTER_ID=$NFT_ID
NEXT_PUBLIC_IPX_STREAM_CANISTER_ID=$IPX_STREAM_ID
NEXT_PUBLIC_IPX_DAO_CANISTER_ID=$IPX_DAO_ID
NEXT_PUBLIC_REVENUE_API_CONNECTOR_CANISTER_ID=$REVENUE_API_CONNECTOR_ID
NEXT_PUBLIC_IC_HOST=http://localhost:4943
EOF


cd ..

echo -e "${GREEN}Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd frontend && npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Connect wallet and test the platform"
echo ""
echo "Stop IC replica: cd ipx-protocol && dfx stop"
