import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import '../css/login.css';
import { useStateContext } from "../context/ContextProvider";
import { useState } from "react";
import { login } from "../utils/backend.js";

export default function Login() {

    let { setUser, setToken } = useStateContext();
    let [error, setError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        let payload = {
            username: data.get("username"),
            password: data.get("password"),
        }

        login(payload, setError, setUser, setToken);


    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h1" variant="h5" className="headerTitle">
                    LOGIN USER
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <Typography className="error">
                        {error}
                    </Typography>
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: '#262626' }}
                    >
                        LogIn
                    </Button>

                </Box>
            </Box>
        </Container>
    );
}