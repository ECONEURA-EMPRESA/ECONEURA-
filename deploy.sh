#!/bin/bash
# deploy.sh
# MASTER DEPLOY SCRIPT for ECONEURA-CLOUD
# Run this to ship to Google Cloud.

set -e

echo "🚀 DEPLOYING ECONEURA TO GOOGLE CLOUD..."

# 0. Saneamento y Checks
if ! command -v terraform &> /dev/null; then
    echo "❌ ERROR: 'terraform' no encontrado. Por favor instálalo."
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ ERROR: 'gcloud' no encontrado. Por favor instálalo."
    exit 1
fi

# 1. INFRASTRUCTURE
echo "🏗️ Applying Terraform..."
cd infrastructure
terraform init
terraform apply -auto-approve
cd ..

# 2. BACKEND
echo "🧠 Deploying Backend to Cloud Run..."
cd packages/backend
# Este comando usa Google Cloud Build para construir y desplegar
gcloud run deploy econeura-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --project gen-lang-client-0254169723 \
  --quiet
cd ../..

# 3. FRONTEND
echo "🎨 Deploying Frontend to Firebase Hosting..."
cd packages/frontend
npm install
npm run build
cd ../..
firebase deploy --only hosting --project gen-lang-client-0254169723

echo "✅ DEPLOY COMPLETE!"
echo "🌍 URL: $(firebase hosting:channel:list --project gen-lang-client-0254169723 --json | grep 'url')"
