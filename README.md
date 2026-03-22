# Plateforme de Gestion Communautaire

Application web de gestion communautaire avec API Laravel et interface Next.js.

## Stack Technique

- Backend: Laravel 12 (PHP 8.2+)
- Frontend: Next.js 16 (React 19)
- Base de données: MySQL
- Authentification: Laravel Sanctum (token Bearer)

## Structure

```text
community-platform/
├── backend/    # API Laravel
├── frontend/   # App Next.js
└── README.md
```

## Prérequis

- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm 10+ (ou pnpm)
- Une base de données accessible

Vérification rapide:

```bash
php --version
composer --version
node --version
npm --version
```

## Démarrage Rapide (Backend + Frontend)

### 1) Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configurer la base dans backend/.env (MySQL):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=community_platform
DB_USERNAME=root
DB_PASSWORD=
```

Ensuite:

```bash
php artisan config:clear
php artisan migrate
php artisan serve
```

API disponible sur http://localhost:8000

### 2) Frontend

Dans un 2e terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible sur http://localhost:3000

## Scripts Utiles

Backend:

```bash
cd backend
php artisan serve
php artisan migrate
php artisan migrate:fresh --seed
php artisan test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run start
```
