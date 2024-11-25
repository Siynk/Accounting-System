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
            'transactionTypes' => 'required', // Optional, must be a string if provided
            'description'     => 'required|string|max:255',
            'productLine'   => 'required|string|max:255',
            'clientID'        => 'nullable',
            'projectID'        => 'nullable',
            'fee'        => 'nullable',
            'amount'          => 'required|numeric|min:0', // Assuming amount cannot be negative
            'category'   => 'required|string|max:255',
            'cashFlow'   => 'required|string|max:255',
            'status'   => 'required|string',

        ];
    }
}
