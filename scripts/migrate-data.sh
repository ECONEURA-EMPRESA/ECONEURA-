#!/bin/bash
# scripts/migrate-data.sh
# MIGRATION: Azure Postgres -> Google Cloud SQL
# REQUISITOS: PGPASSWORD de Azure, gcloud authenticated

set -e

SOURCE_HOST="econeura-psql-prod.postgres.database.azure.com"
SOURCE_USER="econeura_admin"
SOURCE_DB="econeura"
TARGET_INSTANCE="econeura-prod-db"
TARGET_DB="econeura"

echo "🐘 1. DUMPING AZURE DATABASE..."
# Usamos formato directorio (-Fd) y jobs paralelos (-j) para velocidad
mkdir -p dump_output
pg_dump -h $SOURCE_HOST -U $SOURCE_USER -d $SOURCE_DB -Fd -j 4 -f dump_output

echo "☁️ 2. UPLOADING TO GCS..."
BUCKET_NAME="econeura-uploads-gen-lang-client-0254169723"
gcloud storage cp -r dump_output gs://$BUCKET_NAME/migration/

echo "📥 3. IMPORTING TO CLOUD SQL..."
gcloud sql import sql $TARGET_INSTANCE gs://$BUCKET_NAME/migration/dump_output/toc.dat \
    --database=$TARGET_DB --user=postgres

echo "✅ MIGRATION COMPLETE."
