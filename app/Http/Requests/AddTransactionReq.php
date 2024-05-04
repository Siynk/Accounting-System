<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class AddTransactionReq extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transactionType' => 'sometimes|string', // Optional, must be a string if provided
            'description'     => 'required|string|max:255',
            'paymentMethod'   => 'required|string|max:255',
            'counterParty'    => 'required|string|max:255',
            'amount'          => 'required|numeric|min:0', // Assuming amount cannot be negative
            'accounts'        => 'nullable|string', // It's okay to be empty
            'activity'        => 'required|string|max:255',
            'category'        => 'required|string|max:255', // Category is now required
            'effectivityDate' => 'nullable|date|after_or_equal:today',
        ];
    }
}
