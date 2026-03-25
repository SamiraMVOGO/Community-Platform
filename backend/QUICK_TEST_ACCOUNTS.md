# Parcours Test (3 minutes)

## 1) Appliquer les migrations

```bash
php artisan migrate
```

## 2) Charger le seeder complet

```bash
php artisan db:seed --class=Database\\Seeders\\QuickJourneySeeder
```

## 3) Comptes prets

- Super admin
  - Email: superadmin@community.local
  - Mot de passe: AdminPass123!
- Agent municipal
  - Email: agent@community.local
  - Mot de passe: AgentPass123!

Profils crees:

- Profil super admin: status `approved`
- Profil agent municipal: status `pending`

## 4) Verification rapide du parcours

1. Connectez-vous en super admin et verifiez l'acces a la gestion des mairies.
2. Connectez-vous en agent municipal et ouvrez l'espace utilisateurs enregistres.
3. Ouvrez l'ecran validations et controlez les statuts pending et approved.
