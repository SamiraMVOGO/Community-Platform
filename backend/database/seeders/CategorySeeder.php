<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Cadres administratifs', 'slug' => 'cadres-administratifs', 'description' => 'Professionnels dans l\'administration publique'],
            ['name' => 'Cadres techniques', 'slug' => 'cadres-techniques', 'description' => 'Ingénieurs et professionnels techniques'],
            ['name' => 'Chefs d\'entreprise', 'slug' => 'chefs-entreprise', 'description' => 'Propriétaires et dirigeants d\'entreprises'],
            ['name' => 'Artisans', 'slug' => 'artisans', 'description' => 'Professionnels de l\'artisanat et métiers manuels'],
            ['name' => 'Commerçants', 'slug' => 'commercants', 'description' => 'Professionnels du commerce et de la distribution'],
            ['name' => 'Jeunes entrepreneurs', 'slug' => 'jeunes-entrepreneurs', 'description' => 'Créateurs d\'entreprises et startups'],
            ['name' => 'Investisseurs / Partenaires', 'slug' => 'investisseurs-partenaires', 'description' => 'Investisseurs et partenaires économiques'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
