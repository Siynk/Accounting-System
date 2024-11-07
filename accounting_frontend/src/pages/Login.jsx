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
import { Grid } from "@mui/material";
import { Link } from "react-router-dom";


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
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography variant="h5" className="headerTitle">
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
                        sx={{
                            '& label': {
                                color: 'rgb(38, 143, 67)', // Normal label color
                            },
                            '& label.Mui-focused': {
                                color: 'rgb(65, 195, 102)',
                            },
                            '& .MuiInput-underline:after': {
                                borderBottomColor: 'rgb(65, 195, 102)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '& .MuiInputBase-input': {
                                    color: 'rgb(65, 195, 102)', // Text field value color
                                },
                            },
                        }}
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
                        sx={{
                            '& label': {
                                color: 'rgb(38, 143, 67)', // Normal label color
                            },
                            '& label.Mui-focused': {
                                color: 'rgb(65, 195, 102)',
                            },
                            '& .MuiInput-underline:after': {
                                borderBottomColor: 'rgb(65, 195, 102)',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgb(65, 195, 102)',
                                },
                                '& .MuiInputBase-input': {
                                    color: 'rgb(65, 195, 102)', // Text field value color
                                },
                            },
                        }}
                    />
                    <Typography className="error" color="error">
                        {error}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <FormControlLabel
                                control={<Checkbox value="remember" sx={{ color: 'rgb(162, 233, 182)' }} />}
                                label="Remember me"
                                sx={{ color: 'rgb(65, 195, 102)' }}
                            />
                        </Grid>
                        <Grid item xs sx={{ marginTop: '12px', marginRight: '-130px' }}>
                            <Link to={'/forgot-password'} variant="body2" style={{ color: 'rgb(154, 150, 240)', }}>
                                Forgot password?
                            </Link>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: 'rgb(65, 195, 102)' }}
                    >
                        Log In
                    </Button>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Link to="/register" variant="body2" style={{ color: 'rgb(154, 150, 240)' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}