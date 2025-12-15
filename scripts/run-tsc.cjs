#!/usr/bin/env node
/**
 * Script para ejecutar TypeScript compiler en el frontend
 * Uso: node scripts/run-tsc.cjs [opciones]
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const frontendPath = path.join(__dirname, '..', 'packages', 'frontend');

try {
  // Ejecutar tsc desde el directorio del frontend
  // Usar tsc directamente del node_modules si existe, sino npx
  const tscPath = path.join(frontendPath, 'node_modules', '.bin', 'tsc');
  const fs = require('fs');
  const useLocalTsc = fs.existsSync(tscPath);
  
  const command = useLocalTsc 
    ? `node "${tscPath}" ${args.join(' ')}`
    : `npx tsc ${args.join(' ')}`;
  
  execSync(command, {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  process.exit(0);
} catch (error) {
  // El error ya se muestra por stdio: 'inherit'
  process.exit(1);
}

