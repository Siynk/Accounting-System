<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function authorize($credentials)
    {
        // Attempt to authenticate the user
        if (Auth::attempt($credentials)) {
            // Authentication successful
            $user = Auth::user();
            $token = $user->createToken('AuthToken')->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
            ];
        }
    }
}
