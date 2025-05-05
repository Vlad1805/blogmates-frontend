import { useState } from "react";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/api/blogmates-backend";

export default function UserProfileIcon() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { setAuthStatus, userData } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
    <>
      <IconButton onClick={handleClick}>
        <Avatar src={userData?.profile_picture ? `data:${userData.profile_picture_content_type};base64,${userData.profile_picture}` : undefined}/>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          handleClose();
          navigate("/profile");
        }}>
          View Profile
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          handleLogout();
        }}>
          Log Out
        </MenuItem>
      </Menu>
    </>
  );
}
