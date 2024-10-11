<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserReq;
use App\Http\Requests\RegisterClientReq;
use App\Http\Requests\UpdateUserReq;
use App\Http\Services\UserService;
use App\Models\ClientRegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

    public function registerClient(RegisterClientReq $request)
    {
        // Retrieve the validated data from the request
        $validatedData = $request->validated();

        // Hash the password before storing
        $validatedData['password'] = bcrypt($validatedData['password']);

        // Create a new user in the database using the User model
        $user = User::create($validatedData);

        // Check if the user was created successfully
        if ($user) {
            // Add the user ID to the validated data
            $validatedData['userID'] = $user->id;

            // Create a new ClientRegistrationRequest instance with the user ID and default status
            $clientRequest = ClientRegistrationRequest::create([
                'userID' => $user->id,
            ]);

            // Check if the client registration request was created successfully
            if ($clientRequest) {
                // Both user and client registration request creation were successful
                return response()->json(['message' => 'Client registration request successfully sent'], 201);
            } else {
                // Client registration request creation failed
                // Rollback the user creation since it was unsuccessful
                $user->delete();
                return response()->json(['message' => 'Failed to add client registration request'], 422);
            }
        } else {
            // User creation failed
            return response()->json(['message' => 'Failed to register'], 422);
        }
    }

    public function getAllClients()
    {
        $clients = User::where('userType', 'client')->get();

        return response()->json($clients);
    }

    public function deleteUser(Request $request)
    {
        $id = $request->input('userID');
        try {
            $user = User::findOrFail($id);
            $user->isDeleted = 1;
            $user->save();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting user', 'details' => $e->getMessage()], 500);
        }
    }

    public function filterClients(Request $request)
    {
        $searchText = $request->input('searchText');

        // Start building the query
        $query = User::query();
        $query->select('users.*');

        if ($searchText) {
            $query->where(function ($q) use ($searchText) {
                $q->where('company', 'like', '%' . $searchText . '%')
                    ->orWhere('name', 'like', '%' . $searchText . '%')
                    ->orWhere('userType', 'like', '%' . $searchText . '%')
                    ->orWhere('address', 'like', '%' . $searchText . '%')
                    ->orWhere('email', 'like', '%' . $searchText . '%')
                    ->orWhere('contact', 'like', '%' . $searchText . '%');
            });
        }

        $query->where('isDeleted', 0);
        $query->where('userType', 'client');

        // Execute the query and return results as JSON
        $filteredClients = $query->get();

        return response()->json($filteredClients);
    }

    public function sendForgotPasswordEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email address not found'], 200);
        }

        // Generate temporary password
        $temporaryPassword = Str::random(8);

        // Update user's password with the temporary password (hashed)
        $user->password = bcrypt($temporaryPassword);
        $user->save();

        // Send the email with the temporary password
        Mail::send('emails.forgot-password', ['user' => $user, 'temporaryPassword' => $temporaryPassword], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Your Temporary Password');
        });

        return response()->json(['message' => 'An email has been sent with your temporary password.'], 200);
    }
}
