<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Registration Approved</title>
</head>
<body style="font-family: Verdana, Geneva, sans-serif; background-color: #f2f2f2; color: #333; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px;">
        <h1 style="color: #568d2e; text-align: center;">Client Registration Approved</h1>
        <p style="font-size: 16px;">Hello <strong>{{ $user->name }}</strong>,</p>
        <p style="font-size: 16px;">Congratulations! Your client registration request has been approved.</p>
        <p style="font-size: 16px;">You can now access all the services available to approved clients. Please login to your account to start using our services.</p>
        <p style="font-size: 16px;">If you have any questions, feel free to reach out to us.</p>
        <p style="font-size: 16px; text-align: center; margin-top: 20px;">Thank you for choosing us!</p>
    </div>
</body>
</html>
