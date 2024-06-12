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

        if ($authorizedUserData['success']) {
            return response()->json($authorizedUserData);
        }

        // Authentication failed or client not approved
        return response()->json([
            'message' => $authorizedUserData['message'],
        ], 401);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
