<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestAccess extends Model
{
    use HasFactory;

    protected $table = 'request_access';
    protected $fillable = [
        'module_id',
        'user_id',
        'status'
    ];
    public $timestamps = false;

    public function module()
    {
        return $this->belongsTo(Modules::class, 'module_id');
    }
}
