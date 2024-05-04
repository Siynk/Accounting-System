<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Services\AuthService;

class AuthController extends Controller
{
    private $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request)
    {
        // Retrieve validated data
        $credentials = $request->validated();

        $authorizedUserData = $this->authService->authorize($credentials);
        if ($authorizedUserData) {
            return response()->json($authorizedUserData);
        }

        // Authentication failed
        return response()->json([
            'message' => 'Invalid username or password',
        ], 401);

        // return response()->json([
        //     'user' => Hash::make('asdf1234'),
        //     'token' => "test"
        // ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
