<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemporaryTransactionEdits extends Model
{
    use HasFactory;
    protected $table = 'temporarytransactionedits';
    protected $fillable = [
        'newDescription',
        'clientID',
        'transactionID',
        'newAmount',
        'status',
        'editDate'
    ];
    public $timestamps = false;
}
