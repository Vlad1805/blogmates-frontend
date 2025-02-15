import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          BlogMates
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate("/about")}>
            About
          </Button>
          <Button color="inherit" onClick={() => navigate("/login")}>
            Log In
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
