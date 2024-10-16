<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientRegistrationRequest extends Model
{
    use HasFactory;
    protected $table = 'clientregistrationrequest';

    protected $fillable = [
        'status',
        'userID',
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'id');
    }
}
