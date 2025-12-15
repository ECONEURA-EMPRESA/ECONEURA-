#!/bin/bash
# Migrate GitHub Secrets to Azure Key Vault
# SECURITY: This script helps migrate from GitHub Secrets to Azure Key Vault

set -e

KEYVAULT_NAME="econeura-kv-production"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}🔐 Migrating GitHub Secrets to Azure Key Vault${RESET}\n"

# Check prerequisites
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not installed${RESET}"
    exit 1
fi

# Check Azure login
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure${RESET}"
    az login
fi

echo -e "${GREEN}✅ Prerequisites OK${RESET}\n"

# Get Key Vault name
read -p "Enter Key Vault name (default: $KEYVAULT_NAME): " INPUT_KV
if [ -n "$INPUT_KV" ]; then
    KEYVAULT_NAME="$INPUT_KV"
fi

echo -e "\n${BOLD}Migrating secrets to Key Vault: $KEYVAULT_NAME${RESET}\n"

# Function to set secret securely
set_secret() {
    SECRET_NAME=$1
    DISPLAY_NAME=$2
    
    echo -e "${YELLOW}Setting secret: $DISPLAY_NAME${RESET}"
    read -sp "Enter value for $DISPLAY_NAME (input hidden): " SECRET_VALUE
    echo
    
    if [ -z "$SECRET_VALUE" ]; then
        echo -e "${RED}⚠️  Empty value, skipping${RESET}"
        return
    fi
    
    az keyvault secret set \
        --vault-name "$KEYVAULT_NAME" \
        --name "$SECRET_NAME" \
        --value "$SECRET_VALUE" \
        --output none 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $DISPLAY_NAME migrated${RESET}\n"
    else
        echo -e "${RED}❌ Failed to set $DISPLAY_NAME${RESET}\n"
    fi
}

# Migrate critical secrets
echo -e "${BOLD}📋 Migrating production secrets:${RESET}\n"

set_secret "POSTGRES-ADMIN-PASSWORD" "PostgreSQL Admin Password"
set_secret "GEMINI-API-KEY" "Gemini API Key"
set_secret "DATABASE-URL" "Database Connection String"
set_secret "REDIS-PASSWORD" "Redis Password"
set_secret "JWT-SECRET" "JWT Secret (min 32 chars)"

echo -e "\n${BOLD}${GREEN}🎉 Migration Complete!${RESET}\n"

echo -e "${BOLD}Next steps:${RESET}"
echo "1. Update GitHub Actions workflows to use Key Vault"
echo "2. Verify workflows can read from Key Vault"
echo "3. Delete secrets from GitHub Secrets manually:"
echo "   https://github.com/ECONEURA-EMPRESA/ECONEURA-GO/settings/secrets/actions"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Test the workflows before deleting GitHub Secrets!${RESET}"
