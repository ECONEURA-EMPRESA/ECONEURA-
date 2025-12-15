#!/bin/bash
# Automated GitHub Secrets Configuration for ECONEURA-OK
# Usage: ./configure-secrets.sh

set -e

REPO="ECONEURA-EMPRESA/ECONEURA-OK"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${BOLD}🔐 GitHub Secrets Automation - ECONEURA-OK${RESET}\n"

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not installed${RESET}"
    echo "Install: https://cli.github.com/"
    exit 1
fi

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI (az) not installed${RESET}"
    echo "Install: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check GitHub CLI auth
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to GitHub CLI${RESET}"
    echo "Running: gh auth login"
    gh auth login
fi

# Check Azure CLI auth
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure CLI${RESET}"
    echo "Running: az login"
    az login
fi

echo -e "${GREEN}✅ Prerequisites OK${RESET}\n"

# Get Azure subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "📋 Subscription ID: $SUBSCRIPTION_ID"

# 1. AZURE_CREDENTIALS
echo -e "\n${BOLD}[1/4] Creating Service Principal with LEAST PRIVILEGE...${RESET}"
SP_NAME="econeura-github-actions-$(date +%s)"

# Get Resource Group
RG_NAME=$(az group list --query "[?contains(name, 'econeura')].name" -o tsv | head -n 1)
if [ -z "$RG_NAME" ]; then
    read -p "Enter Resource Group name: " RG_NAME
fi
echo "Using Resource Group: $RG_NAME"

# SECURITY FIX: Use specific roles instead of Contributor
# Create service principal WITHOUT role assignment
SP_JSON=$(az ad sp create-for-rbac \
  --name "$SP_NAME" \
  --skip-assignment \
  --sdk-auth 2>/dev/null)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create Service Principal${RESET}"
    exit 1
fi

# Extract appId
APP_ID=$(echo "$SP_JSON" | grep -o '"clientId"\s*:\s*"[^"]*"' | cut -d'"' -f4)

# Assign minimal required roles at Resource Group scope
echo "Assigning minimal roles..."
az role assignment create --assignee "$APP_ID" --role "Website Contributor" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME" 2>/dev/null
az role assignment create --assignee "$APP_ID" --role "Web Plan Contributor" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME" 2>/dev/null
az role assignment create --assignee "$APP_ID" --role "Key Vault Secrets User" --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "$SP_JSON" | gh secret set AZURE_CREDENTIALS -R "$REPO"
    echo -e "${GREEN}✅ AZURE_CREDENTIALS configured${RESET}"
else
    echo -e "${RED}❌ Failed to create Service Principal${RESET}"
    exit 1
fi

# 2. AZURE_WEBAPP_NAME_BACKEND
echo -e "\n${BOLD}[2/4] Searching for Backend App Service...${RESET}"

BACKEND_NAMES=$(az webapp list --query "[?contains(name, 'econeura') || contains(name, 'backend')].name" -o tsv)

if [ -z "$BACKEND_NAMES" ]; then
    echo -e "${YELLOW}⚠️  No backend App Service found${RESET}"
    read -p "Enter Backend App Service name manually: " BACKEND_NAME
else
    echo "Found App Services:"
    select BACKEND_NAME in $BACKEND_NAMES; do
        if [ -n "$BACKEND_NAME" ]; then
            break
        fi
    done
fi

echo "$BACKEND_NAME" | gh secret set AZURE_WEBAPP_NAME_BACKEND -R "$REPO"
echo -e "${GREEN}✅ AZURE_WEBAPP_NAME_BACKEND = $BACKEND_NAME${RESET}"

# 3. AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND
echo -e "\n${BOLD}[3/4] Getting Backend Publish Profile...${RESET}"

RG=$(az webapp show --name "$BACKEND_NAME" --query resourceGroup -o tsv)
PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles \
  --name "$BACKEND_NAME" \
  --resource-group "$RG" \
  --xml 2>/dev/null)

if [ -n "$PUBLISH_PROFILE" ]; then
    echo "$PUBLISH_PROFILE" | gh secret set AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND -R "$REPO"
    echo -e "${GREEN}✅ AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND configured${RESET}"
else
    echo -e "${RED}❌ Failed to get publish profile${RESET}"
fi

# 4. AZURE_STATIC_WEB_APPS_API_TOKEN
echo -e "\n${BOLD}[4/4] Searching for Static Web App...${RESET}"

SWA_NAMES=$(az staticwebapp list --query "[?contains(name, 'econeura') || contains(name, 'frontend')].name" -o tsv)

if [ -z "$SWA_NAMES" ]; then
    echo -e "${YELLOW}⚠️  No Static Web App found${RESET}"
    read -p "Enter Static Web App name manually (or 'skip' to skip): " SWA_NAME
    if [ "$SWA_NAME" = "skip" ]; then
        echo -e "${YELLOW}⚠️  Skipping Static Web App configuration${RESET}"
        SWA_NAME=""
    fi
else
    echo "Found Static Web Apps:"
    select SWA_NAME in $SWA_NAMES "skip"; do
        if [ "$SWA_NAME" = "skip" ]; then
            echo -e "${YELLOW}⚠️  Skipping Static Web App configuration${RESET}"
            SWA_NAME=""
            break
        elif [ -n "$SWA_NAME" ]; then
            break
        fi
    done
fi

if [ -n "$SWA_NAME" ]; then
    SWA_TOKEN=$(az staticwebapp secrets list \
      --name "$SWA_NAME" \
      --query "properties.apiKey" -o tsv 2>/dev/null)
    
    if [ -n "$SWA_TOKEN" ]; then
        echo "$SWA_TOKEN" | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -R "$REPO"
        echo -e "${GREEN}✅ AZURE_STATIC_WEB_APPS_API_TOKEN configured${RESET}"
    fi
fi

# OPTIONAL SECRETS
echo -e "\n${BOLD}📦 Optional Secrets${RESET}"

# DATABASE_URL
read -p "Configure DATABASE_URL? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter DATABASE_URL: " DATABASE_URL
    echo "$DATABASE_URL" | gh secret set DATABASE_URL -R "$REPO"
    echo -e "${GREEN}✅ DATABASE_URL configured${RESET}"
fi

# SNYK_TOKEN
read -p "Configure SNYK_TOKEN? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter SNYK_TOKEN: " SNYK_TOKEN
    echo "$SNYK_TOKEN" | gh secret set SNYK_TOKEN -R "$REPO"
    echo -e "${GREEN}✅ SNYK_TOKEN configured${RESET}"
fi

echo -e "\n${BOLD}${GREEN}🎉 Secrets Configuration Complete!${RESET}\n"
echo "View secrets: https://github.com/$REPO/settings/secrets/actions"
echo -e "\n${BOLD}Next steps:${RESET}"
echo "1. Go to GitHub Actions: https://github.com/$REPO/actions"
echo "2. Select 'App Deploy' workflow"
echo "3. Click 'Run workflow' → Select environment → Run"
