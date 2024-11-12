<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Import related models
use App\Models\User;
use App\Models\Project;
use App\Models\Transaction;

class Payment extends Model
{
    use HasFactory;

    // Define the table name (optional if table name follows the plural convention)
    protected $table = 'payment';

    // Define which fields can be mass-assigned
    protected $fillable = [
        'clientID', 
        'projectID', 
        'transactionID', 
        'amount', 
        'status'
    ];

    // Automatically manage created_at and updated_at columns
    public $timestamps = true;

    /**
     * Get the client associated with the payment.
     */
    public function client()
    {
        // A payment belongs to a client (user)
        return $this->belongsTo(User::class, 'clientID');
    }

    /**
     * Get the project associated with the payment.
     */
    public function project()
    {
        // A payment belongs to a project
        return $this->belongsTo(Project::class, 'projectID');
    }

    /**
     * Get the transaction associated with the payment.
     */
    public function transaction()
    {
        // A payment belongs to a transaction
        return $this->belongsTo(Transaction::class, 'transactionID');
    }
}
