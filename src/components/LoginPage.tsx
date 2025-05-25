import { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { loginUser } from "@/api/blogmates-backend";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { setAuthStatus } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async () => {
    setError("");
    setSuccess(false);
    try {
      await loginUser({ username, password });
      setAuthStatus(true);
      setSuccess(true);
      navigate("/profile");
    } catch (err) {
      setError((err as any)?.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "auto",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4" textAlign="center">
        Login to BlogMates
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Login successful!</Alert>}

      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Log In
      </Button>
    </Box>
  );
}
