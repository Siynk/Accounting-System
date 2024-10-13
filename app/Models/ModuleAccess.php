<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleAccess extends Model
{
    use HasFactory;
    protected $table = 'module_access';
    protected $fillable = [
        'user_id',
        'module_id',
        'hasAccess'
    ];
    public $timestamps = false;

    public function module()
    {
        return $this->belongsTo(Modules::class, 'module_id');
    }
}
