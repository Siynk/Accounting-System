<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserReq;
use App\Http\Requests\RegisterClientReq;
use App\Http\Requests\UpdateUserReq;
use App\Http\Services\UserService;
use App\Models\ClientRegistrationRequest;
use App\Models\ModuleAccess;
use App\Models\Modules;
use App\Models\RequestAccess;
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

    public function getPendingClientRegistrationRequests()
    {
        $clientRequests = ClientRegistrationRequest::with('user:id,name,email')
            ->where('status', 'pending') // Adjust the status as necessary
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'userID' => $request->userID,
                    'status' => $request->status,
                    'user' => [
                        'name' => $request->user->name ?? null,
                        'email' => $request->user->email ?? null,
                    ],
                ];
            });

        return response()->json($clientRequests);
    }


    public function respondToClientRequest(Request $request)
    {
        $validatedData = $request->validate([
            'userID' => 'required|exists:users,id',
            'status' => 'required|in:Approved,Declined', // Ensure status is either Approve or Decline
        ]);

        $clientRequest = ClientRegistrationRequest::where('userID', $validatedData['userID'])->first();

        if (!$clientRequest) {
            return response()->json(['message' => 'Client registration request not found.'], 404);
        }

        // Update the status of the client registration request
        $clientRequest->status = $validatedData['status'];
        $clientRequest->save();

        return response()->json(['message' => 'Client registration request processed successfully.']);
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

    public function getAllAdmin()
    {
        $admins = User::where('userType', 'admin')->get();
        return response()->json($admins);
    }

    public function addNewAccess(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'modules' => 'required|array',
            'modules.*' => 'required|exists:modules,id',
            'hasAccess' => 'required|boolean',
        ]);

        foreach ($validatedData['modules'] as $moduleId) {
            // Check existing access
            $existingAccess = ModuleAccess::where('user_id', $validatedData['user_id'])
                ->where('module_id', $moduleId)
                ->first();

            if (!$existingAccess) {
                ModuleAccess::create(['user_id' => $validatedData['user_id'], 'module_id' => $moduleId, 'hasAccess' => $validatedData['hasAccess']]);
            }
        }

        return response()->json(['message' => 'Access added successfully'], 201);
    }


    public function updateAccess(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'module_id' => 'required|exists:modules,id',
            'hasAccess' => 'required|boolean',
        ]);

        $access = ModuleAccess::where('user_id', $validatedData['user_id'])
            ->where('module_id', $validatedData['module_id'])
            ->first();

        if (!$access) {
            return response()->json(['message' => 'Access not found'], 404);
        }

        $access->hasAccess = $validatedData['hasAccess'];
        $access->save();

        return response()->json(['message' => 'Access updated successfully', 'data' => $access]);
    }

    public function getAccess(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $accesses = ModuleAccess::with('module:id,description') // Eager load the module relationship
            ->where('user_id', $validatedData['user_id'])
            ->get()
            ->map(function ($access) {
                return [
                    'user_id' => $access->user_id,
                    'module_id' => $access->module_id,
                    'hasAccess' => $access->hasAccess,
                    'module_description' => $access->module->description ?? null,
                ];
            });

        return response()->json($accesses);
    }



    public function getModules()
    {
        $modules = Modules::all();
        return response()->json($modules);
    }

    public function requestAccess(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'modules' => 'required|array',
            'modules.*' => 'required|exists:modules,id',
            'status' => 'required|string', // Assuming status is a string
        ]);

        // Extract the validated data
        $userId = $validatedData['user_id'];
        $modules = $validatedData['modules'];
        $status = $validatedData['status'];

        // Prepare data for bulk insert into request_access table
        $requestAccessData = [];

        foreach ($modules as $moduleId) {
            // Check if the user already has access to this module
            $existingAccess = ModuleAccess::where('user_id', $userId)
                ->where('module_id', $moduleId)
                ->where('hasAccess', true) // Only check for granted access
                ->first();

            if ($existingAccess) {
                // If the admin already has access, you can either skip or return an error message
                return response()->json([
                    'message' => "Admin already has access to module ID {$moduleId}.",
                    'module_id' => $moduleId
                ], 400);
            }

            // If no existing access, prepare the request data
            $requestAccessData[] = [
                'user_id' => $userId,
                'module_id' => $moduleId,
                'status' => $status,
            ];
        }

        // Insert the data into the request_access table if there are new requests
        if (!empty($requestAccessData)) {
            RequestAccess::insert($requestAccessData);
        }

        return response()->json(['message' => 'Access requests submitted successfully'], 201);
    }


    public function getPendingRequestAccess()
    {
        // Retrieve all access requests with a status of 'pending' and eager load the related module
        $pendingRequests = RequestAccess::join('modules', 'request_access.module_id', '=', 'modules.id')
            ->join('users', 'request_access.user_id', '=', 'users.id')
            ->select('request_access.*', 'users.name as name', 'modules.description as description')
            ->where('status', 'Pending')->get();
        // Return the results as JSON, including the module description
        return response()->json($pendingRequests);
    }


    public function approvePendingAccessRequest(Request $request)
    {
        $validatedData = $request->validate([
            'request_id' => 'required|exists:request_access,id',
        ]);

        // Retrieve the pending request
        $requestAccess = RequestAccess::with('module')->find($validatedData['request_id']);
        $requestAccess->status = 'Approved';
        $requestAccess->save();

        if ($requestAccess->module) {
            // Check if the ModuleAccess already exists
            $existingAccess = ModuleAccess::where('user_id', $requestAccess->user_id)
                ->where('module_id', $requestAccess->module->id)
                ->first();

            if ($existingAccess) {
                // Update existing access
                $existingAccess->hasAccess = true;
                $existingAccess->save();
            } else {
                // Create new ModuleAccess
                ModuleAccess::create([
                    'user_id' => $requestAccess->user_id,
                    'module_id' => $requestAccess->module->id,
                    'hasAccess' => true,
                ]);
            }
        } else {
            return response()->json(['message' => 'Module not found for this request.'], 404);
        }

        return response()->json(['message' => 'Access request approved successfully.']);
    }



    public function declinePendingAccessRequest(Request $request)
    {
        $validatedData = $request->validate([
            'request_id' => 'required|exists:request_access,id',
        ]);

        $requestAccess = RequestAccess::find($validatedData['request_id']);
        $requestAccess->status = 'Declined';
        $requestAccess->save();

        return response()->json(['message' => 'Access request declined successfully.']);
    }
}
