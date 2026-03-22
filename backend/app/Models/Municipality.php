<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'location',
        'mayor_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function mayor()
    {
        return $this->belongsTo(User::class, 'mayor_id');
    }

    public function agents()
    {
        return $this->hasMany(User::class, 'municipality_id')->where('role', 'agent_municipal');
    }

    public function profiles()
    {
        return $this->hasManyThrough(
            Profile::class,
            User::class,
            'municipality_id',
            'user_id'
        );
    }
}
