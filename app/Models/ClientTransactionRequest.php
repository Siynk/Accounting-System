<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientTransactionRequest extends Model
{
    use HasFactory;
    protected $table = 'clienttransactionrequest';
    protected $fillable = [
        'clientID',
        'transactionID',
        'status',
        'action',
        'requestDate'
    ];
    public $timestamps = false;
}
