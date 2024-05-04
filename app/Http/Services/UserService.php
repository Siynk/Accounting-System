<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Auth;

class UserService
{
    public function updateUser($validatedData)
    {
        if (isset($validatedData['password'])) {
            $validatedData['password'] = bcrypt($validatedData['password']);
        }
        // Get the authenticated user
        $user = Auth::user();

        // Update the user's information with the validated data
        $user->update($validatedData);
    }
}
