<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientRegistrationRequest extends Model
{
    use HasFactory;
    protected $table = 'clientregistrationrequest';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'status',
        'userID',
    ];
    public $timestamps = false;
}
