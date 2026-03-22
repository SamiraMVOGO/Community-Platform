<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['profile_id', 'type', 'path', 'original_name'];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }
}
