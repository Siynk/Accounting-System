<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $table = 'project';
    protected $fillable = [
        'clientID',
        'projectName',
        'status',
        'created_at',
        'updated_at'
    ];
    public $timestamps = false;

    public function payments()
    {
        return $this->hasMany(Payment::class, 'projectID');
    }
}
