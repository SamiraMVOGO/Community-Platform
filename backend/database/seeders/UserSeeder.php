<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin Communauté',
            'email' => 'admin@community.local',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Sample users with profiles
        $userData = [
            [
                'name' => 'Marie Dupont',
                'email' => 'marie.dupont@email.com',
                'category_id' => 2,
                'bio' => 'Développeuse full-stack passionnée par React et Laravel. 8 ans d\'expérience dans le développement web.',
                'skills' => 'React, Laravel, Vue.js, PostgreSQL, Docker',
                'sector' => 'Technologie',
                'location' => 'Paris',
            ],
            [
                'name' => 'Jean Martin',
                'email' => 'jean.martin@email.com',
                'category_id' => 1,
                'bio' => 'Expert en management et stratégie d\'entreprise. Aide les startups à se structurer.',
                'skills' => 'Management, Stratégie, Leadership, Planning',
                'sector' => 'Administration',
                'location' => 'Lyon',
            ],
            [
                'name' => 'Sophie Bernard',
                'email' => 'sophie.bernard@email.com',
                'category_id' => 3,
                'bio' => 'Experte-comptable avec 15 ans d\'expérience. Spécialisée en optimisation fiscale.',
                'skills' => 'Comptabilité, Fiscalité, Audit, Planification Financière',
                'sector' => 'Finance',
                'location' => 'Bordeaux',
            ],
            [
                'name' => 'Pierre Leclerc',
                'email' => 'pierre.leclerc@email.com',
                'category_id' => 2,
                'bio' => 'Ingénieur informatique spécialisé dans les solutions cloud et l\'infrastructure.',
                'skills' => 'Cloud, AWS, Azure, Kubernetes, Terraform',
                'sector' => 'Technologie',
                'location' => 'Marseille',
            ],
            [
                'name' => 'Isabelle Moreau',
                'email' => 'isabelle.moreau@email.com',
                'category_id' => 4,
                'bio' => 'Créatrice et directrice de sa startup dans le secteur du digital.',
                'skills' => 'Entrepreneuriat, Gestion, Vente, Digital',
                'sector' => 'Startup',
                'location' => 'Toulouse',
            ],
            [
                'name' => 'Luc Fontaine',
                'email' => 'luc.fontaine@email.com',
                'category_id' => 4,
                'bio' => 'Entrepreneur depuis 10 ans, spécialiste du e-commerce et du marketing digital.',
                'skills' => 'E-commerce, Marketing Digital, Growth, Analytics',
                'sector' => 'Commerce Digital',
                'location' => 'Nice',
            ],
            [
                'name' => 'Nathalie Rousseau',
                'email' => 'nathalie.rousseau@email.com',
                'category_id' => 5,
                'bio' => 'Artisane menuisère avec un passion pour le design et la qualité.',
                'skills' => 'Menuiserie, Design, Restauration, Bois massif',
                'sector' => 'Artisanat',
                'location' => 'Lille',
            ],
            [
                'name' => 'Marc Dubois',
                'email' => 'marc.dubois@email.com',
                'category_id' => 5,
                'bio' => 'Commerçant depuis 20 ans. Propriétaire d\'un magasin de détail prospère.',
                'skills' => 'Vente, Gestion Commerciale, Client Service, Merchandising',
                'sector' => 'Commerce',
                'location' => 'Strasbourg',
            ],
            [
                'name' => 'Valérie Lefevre',
                'email' => 'valerie.lefevre@email.com',
                'category_id' => 6,
                'bio' => 'Jeune entrepreneur avec vision innovante dans les services technologiques.',
                'skills' => 'Innovation, SaaS, Startup, Business Development',
                'sector' => 'Tech Startup',
                'location' => 'Rennes',
            ],
            [
                'name' => 'Thomas Gauthier',
                'email' => 'thomas.gauthier@email.com',
                'category_id' => 7,
                'bio' => 'Investisseur business angel intéressé par les projets innovants et durables.',
                'skills' => 'Investissement, Due Diligence, Conseil Stratégique',
                'sector' => 'Finance',
                'location' => 'Monaco',
            ],
        ];

        foreach ($userData as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]);

            Profile::create([
                'user_id' => $user->id,
                'category_id' => $data['category_id'],
                'bio' => $data['bio'],
                'skills' => $data['skills'],
                'experience' => 'Expérience professionnelle riche et diversifiée',
                'education_level' => 'Bac+3 ou supérieur',
                'sector' => $data['sector'],
                'location' => $data['location'],
                'phone' => '06 ' . rand(10, 99) . ' ' . rand(10, 99) . ' ' . rand(10, 99) . ' ' . rand(10, 99),
                'status' => 'approved',
            ]);
        }
    }
}
