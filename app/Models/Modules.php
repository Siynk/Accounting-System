<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modules extends Model
{
    use HasFactory;
    protected $table = 'modules';
    protected $fillable = [
        'description',
        'created_at',
        'updated_at'
    ];
    public $timestamps = false;
}
