#!/bin/bash
set -e

echo "Verifying builds..."

# Build all packages
npx turbo run build

echo "Build verification complete!"
