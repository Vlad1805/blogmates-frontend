import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  useMediaQuery, 
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuIcon from '@mui/icons-material/Menu';
import UserProfileIcon from "./UserProfileIcon";
import MobileMenu from "./MobileMenu";
import { useState } from "react";

export default function Navbar() {
  const { userData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
            <MobileMenu 
              open={mobileMenuOpen} 
              onClose={() => setMobileMenuOpen(false)} 
            />
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" onClick={() => navigate("/feed")}>
              Feed
            </Button>
            <Button color="inherit" onClick={() => navigate("/search")}>
              Search
            </Button>
            {isAuthenticated && (
              <Button color="inherit" onClick={() => navigate("/create")}>
                Create
              </Button>
            )}
            <Button color="inherit" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button color="inherit" onClick={() => navigate("/about")}>
              About
            </Button>

            {isAuthenticated ? (
              <UserProfileIcon />
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <Button variant="contained" color="secondary" onClick={() => navigate("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
