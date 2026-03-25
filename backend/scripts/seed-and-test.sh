#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/5] Verification de l'environnement Laravel"
php artisan --version

echo "[2/5] Migration de la base"
php artisan migrate --force

echo "[3/5] Seed complet"
php artisan db:seed --class=Database\\Seeders\\QuickJourneySeeder --force

echo "[4/5] Nettoyage caches"
php artisan optimize:clear

echo "[5/5] Execution des tests backend"
php artisan test

echo "Termine: migrations + seeder complet + tests backend OK"
