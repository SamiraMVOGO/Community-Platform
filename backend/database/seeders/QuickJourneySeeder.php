<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Municipality;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class QuickJourneySeeder extends Seeder
{
    /**
    * Seeder minimal et idempotent pour les tests fonctionnels.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Cadres administratifs', 'slug' => 'cadres-administratifs', 'description' => 'Professionnels de l administration publique'],
            ['name' => 'Cadres techniques', 'slug' => 'cadres-techniques', 'description' => 'Ingenieurs et profils techniques'],
            ['name' => 'Chefs entreprise', 'slug' => 'chefs-entreprise', 'description' => 'Dirigeants et createurs d entreprise'],
            ['name' => 'Artisans', 'slug' => 'artisans', 'description' => 'Metiers artisanaux et manuels'],
            ['name' => 'Commercants', 'slug' => 'commercants', 'description' => 'Acteurs du commerce et de la distribution'],
            ['name' => 'Jeunes entrepreneurs', 'slug' => 'jeunes-entrepreneurs', 'description' => 'Entrepreneurs et startups'],
            ['name' => 'Investisseurs partenaires', 'slug' => 'investisseurs-partenaires', 'description' => 'Partenaires financiers et investisseurs'],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        $municipality = Municipality::updateOrCreate(
            ['slug' => 'commune-centre'],
            [
                'name' => 'Commune Centre',
                'description' => 'Municipalite de test principale',
                'location' => 'Centre-ville',
                'is_active' => true,
            ]
        );

        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@community.local'],
            [
                'name' => 'Super Admin Test',
                'password' => Hash::make('AdminPass123!'),
                'role' => 'super_admin',
                'municipality_id' => null,
                'created_by' => null,
                'is_active' => true,
            ]
        );

        $agent = User::updateOrCreate(
            ['email' => 'agent@community.local'],
            [
                'name' => 'Agent Municipal Test',
                'password' => Hash::make('AgentPass123!'),
                'role' => 'agent_municipal',
                'municipality_id' => $municipality->id,
                'created_by' => $superAdmin->id,
                'is_active' => true,
            ]
        );

        $categoryAdmin = Category::where('slug', 'cadres-administratifs')->firstOrFail();
        $categoryTech = Category::where('slug', 'cadres-techniques')->firstOrFail();

        Profile::updateOrCreate(
            ['user_id' => $superAdmin->id],
            [
                'category_id' => $categoryAdmin->id,
                'bio' => 'Super administrateur de la plateforme.',
                'skills' => 'Administration,Gouvernance',
                'experience' => '8 ans',
                'education_level' => 'Master',
                'sector' => 'Administration publique',
                'location' => 'Commune Centre',
                'phone' => '+237670000001',
                'status' => 'approved',
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $agent->id],
            [
                'category_id' => $categoryTech->id,
                'bio' => 'Agent municipal operationnel.',
                'skills' => 'Suivi terrain,Relation usagers',
                'experience' => '5 ans',
                'education_level' => 'Licence',
                'sector' => 'Service public',
                'location' => 'Commune Centre',
                'phone' => '+237670000002',
                'status' => 'pending',
            ]
        );

        $this->command?->info('QuickJourneySeeder minimal termine.');
        $this->command?->line('- Super admin: superadmin@community.local / AdminPass123!');
        $this->command?->line('- Agent municipal: agent@community.local / AgentPass123!');
        $this->command?->line('- Profils crees: 2 (super admin + agent municipal)');
        $this->command?->line('- Municipalite: ' . $municipality->name);
    }
}
