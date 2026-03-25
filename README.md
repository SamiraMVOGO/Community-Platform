# Plateforme de Gestion Communautaire

Application web de gestion communautaire composee de:

- un backend API Laravel
- un frontend Next.js
- une authentification par token (Sanctum)
- une gestion des utilisateurs, profils, categories, validations et municipalites

## Stack technique

- Backend: Laravel 12, PHP 8.2+
- Frontend: Next.js 16, React 19
- Base de donnees: MySQL
- Auth: Sanctum (Bearer token)

## Structure du projet

```text
community-platform/
├── backend/
├── frontend/
└── README.md
```

## Prerequis

- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm 10+
- MySQL

Verification rapide:

```bash
php --version
composer --version
node --version
npm --version
```

## Installation

### 1) Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configurer la base dans backend/.env:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=community_platform
DB_USERNAME=root
DB_PASSWORD=
```

Puis lancer:

```bash
php artisan config:clear
composer dump-autoload -o
php artisan migrate
php artisan serve
```

API backend: http://localhost:8000/api

### 2) Frontend

Dans un autre terminal:

```bash
cd frontend
npm install
```

Creer frontend/.env:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Lancer:

```bash
npm run dev
```

Frontend: http://localhost:3000

## Seeder complet (recommande)

Le projet utilise un seeder unique et idempotent:

```bash
cd backend
php artisan migrate:fresh --seed --seeder=Database\\Seeders\\QuickJourneySeeder
```

Ce seeder cree:

- categories principales
- 1 municipalite
- 2 utilisateurs de test: super_admin et agent_municipal
- 2 profils associes (super admin: approved, agent: pending)

## Comptes de test

- Super admin: superadmin@community.local / AdminPass123!
- Agent municipal: agent@community.local / AgentPass123!

## Guide de test fonctionnel

### 1) Preparation

Terminal backend:

```bash
cd backend
php artisan optimize:clear
php artisan migrate:fresh --seed --seeder=Database\\Seeders\\QuickJourneySeeder
php artisan serve
```

Terminal frontend:

```bash
cd frontend
npm run dev
```

### 2) Parcours recommande

1. Se connecter en super admin.
2. Verifier l acces aux ecrans d administration globaux.
3. Se connecter en agent municipal, verifier la liste des profils de sa municipalite.
4. Verifier le profil de l agent en statut pending.
5. Verifier le profil du super admin en statut approved.

### 3) Resultat attendu

- Connexion valide pour chaque role.
- Separation des droits respectee selon le role.
- Donnees de validation coherentes: pending et approved.
- Aucune erreur 403, 404 ou 500 non attendue pendant le parcours.

## Tests automatises backend

```bash
cd backend
php artisan test
```

Filtre possible:

```bash
php artisan test --filter=Feature
```

## Script tout-en-un

```bash
cd backend
bash scripts/seed-and-test.sh
```

Ce script execute migrations, seeder complet, nettoyage des caches et tests.

## Commandes utiles

Backend:

```bash
cd backend
php artisan serve
php artisan migrate
php artisan migrate:fresh --seed
php artisan optimize:clear
php artisan migrate:fresh --seed --seeder=Database\\Seeders\\QuickJourneySeeder
php artisan test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run start
```
