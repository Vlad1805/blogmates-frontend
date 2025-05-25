import { Dialog, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from "@mui/material";
import { LikesResponse, UserDataResponse, getUserProfileById } from "@/api/blogmates-backend";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LikesPopupProps {
  open: boolean;
  onClose: () => void;
  likes: LikesResponse[];
}

export default function LikesPopup({ open, onClose, likes }: LikesPopupProps) {
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState<Record<number, UserDataResponse>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!open) return;
      
      setIsLoading(true);
      setError(null);
      const profiles: Record<number, UserDataResponse> = {};

      try {
        for (const like of likes) {
          if (!profiles[like.user]) {
            try {
              const profile = await getUserProfileById(like.user);
              profiles[like.user] = profile;
            } catch (err) {
              console.error(`Failed to fetch profile for user ${like.user}:`, err);
            }
          }
        }
        setUserProfiles(profiles);
      } catch (error) {
        console.error("Failed to fetch user profiles:", error);
        setError((error as any)?.response?.data?.error || "Failed to load user profiles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfiles();
  }, [open, likes]);

  const handleUserClick = (username: string) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'primary.main',
            border: (theme) => `1px solid ${theme.palette.primary.dark}`,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[4]
          }
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Typography variant="body2" color="white" sx={{ p: 2, textAlign: 'center' }}>
            Loading...
          </Typography>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ p: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {likes.map((like) => {
              const userProfile = userProfiles[like.user];
              return (
                <ListItem 
                  key={like.user}
                  onClick={() => userProfile?.username && handleUserClick(userProfile.username)}
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { 
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={userProfile?.profile_picture ? 
                        `data:${userProfile.profile_picture_content_type};base64,${userProfile.profile_picture}` : 
                        undefined
                      }
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    >
                      {userProfile?.username?.[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ color: 'white' }}>
                        {userProfile?.username || 'Unknown User'}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {userProfile?.email}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
            {likes.length === 0 && (
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'white' }}>
                No likes yet
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
} 