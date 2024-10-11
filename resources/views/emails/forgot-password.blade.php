<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Verdana, Geneva, sans-serif; background-color: #f2f2f2; color: #333; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px;">
        <h1 style="color: #568d2e; text-align: center;">Password Reset</h1>
        <p style="font-size: 16px;">Hello <strong>{{ $user->username }}</strong>,</p>
        <p style="font-size: 16px;">Your temporary password is: <strong style="color: #568d2e;">{{ $temporaryPassword }}</strong></p>
        <p style="font-size: 16px;">Please use this password to sign in, and make sure to update your password after logging in.</p>
        <p style="font-size: 16px; text-align: center; margin-top: 20px;">Thank you!</p>
    </div>
</body>
</html>
