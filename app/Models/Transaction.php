<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $table = 'transaction';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transactionDate',
        'description',
        'productLine',
        'clientID',
        'projectID',
        'amount',
        'status',
        'category',
        'cashFlow',
        'isDeleted',
        'invoice_number',
        'fee'
    ];

    public $timestamps = false;
}
