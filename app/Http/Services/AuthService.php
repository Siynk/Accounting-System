<?php

namespace App\Http\Services;

use App\Models\ClientRegistrationRequest;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function authorize($credentials)
    {
        // Attempt to authenticate the user
        if (Auth::attempt($credentials)) {
            // Authentication successful
            $user = Auth::user();

            // Check if the user is a client
            if ($user->userType === 'client') {
                // Check if the client's registration request is approved
                $clientRequest = ClientRegistrationRequest::where('userID', $user->id)
                    ->where('status', 'Approved')
                    ->first();

                if (!$clientRequest) {
                    // If the client is not approved, log out the user
                    Auth::logout();
                    return [
                        'success' => false,
                        'message' => 'Your account is not yet approved by the administrator.'
                    ]; // Return specific message for unapproved client
                }
            }

            // If everything is fine, create the token
            $token = $user->createToken('AuthToken')->plainTextToken;

            return [
                'success' => true,
                'user' => $user,
                'token' => $token,
            ]; // Return user data and token
        }

        return [
            'success' => false,
            'message' => 'Invalid username or password.'
        ]; // Return message for invalid credentials
    }
}
