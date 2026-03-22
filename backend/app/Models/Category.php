<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    public function profiles()
    {
        return $this->hasMany(Profile::class);
    }
}
