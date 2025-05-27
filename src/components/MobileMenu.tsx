import { 
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "@/api/blogmates-backend";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { userData, isAuthenticated, setAuthStatus } = useAuth();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setAuthStatus(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderLeft: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <Box sx={{ width: 250 }}>
        <List>
          <ListItemButton onClick={() => handleNavigation('/')}>
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/about')}>
            <ListItemText primary="About" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/feed')}>
            <ListItemText primary="Feed" />
          </ListItemButton>
          {isAuthenticated ? (
            <>
              <Divider />
              <ListItemButton onClick={() => handleNavigation('/create')}>
                <ListItemText primary="Create Post" />
              </ListItemButton>
              <ListItemButton onClick={() => handleNavigation(`/profile/${userData?.username}`)}>
                <ListItemText primary="My Profile" />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </>
          ) : (
            <>
              <Divider />
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemText primary="Login" />
              </ListItemButton>
              <ListItemButton onClick={() => handleNavigation('/signup')}>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
} 