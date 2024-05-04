<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserReq;
use App\Http\Requests\UpdateUserReq;
use App\Http\Services\UserService;
use App\Models\User;

class UserController extends Controller
{
    private $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function updateUser(UpdateUserReq $request)
    {
        // Retrieve the validated data from the request
        $validatedData = $request->validated();

        $this->userService->updateUser($validatedData);

        return response()->json(['message' => 'User updated successfully.']);
    }

    public function addUser(AddUserReq $request)
    {
        // Retrieve the validated data from the request
        $validatedData = $request->validated();
        $validatedData['password'] = bcrypt($validatedData['password']);
        // Create a new user in the database using the User model
        $user = User::create($validatedData);

        // Check if the user was created successfully
        if ($user) {
            // User creation was successful
            return response()->json(['message' => 'User added successfully'], 201);
        } else {
            // User creation failed
            return response()->json(['message' => 'Failed to add user'], 422);
        }
    }
}
