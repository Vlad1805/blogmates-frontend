import { Box, ListItem, ListItemAvatar, ListItemText, Avatar, Button, Divider } from "@mui/material";
import { UserDataResponse, getUserProfileById } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";

interface PendingRequestItemProps {
  id: number;
  senderProfile: UserDataResponse;
  onSendFriendRequest: (id: number) => void;
  onAcceptRequest: (id: number) => void;
  onDeclineRequest: (id: number) => void;
  showDivider: boolean;
  onProfileUpdate: (profile: UserDataResponse) => void;
}

export default function PendingRequestItem({
  id,
  senderProfile,
  onSendFriendRequest,
  onAcceptRequest,
  onDeclineRequest,
  showDivider,
  onProfileUpdate
}: PendingRequestItemProps) {
  const navigate = useNavigate();

  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleSendFriendRequest = async () => {
    await onSendFriendRequest(senderProfile.id);
    const updatedProfile = await getUserProfileById(senderProfile.id);
    onProfileUpdate(updatedProfile);
  };

  const handleAcceptRequest = async () => {
    await onAcceptRequest(id);
    const updatedProfile = await getUserProfileById(senderProfile.id);
    onProfileUpdate(updatedProfile);
  };

  const handleDeclineRequest = async () => {
    await onDeclineRequest(id);
    const updatedProfile = await getUserProfileById(senderProfile.id);
    onProfileUpdate(updatedProfile);
  };

  return (
    <Box>
      <ListItem alignItems="center" sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        width: '100%',
        padding: '16px 32px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ListItemAvatar>
            <Avatar 
              src={senderProfile.profile_picture ? 
                `data:${senderProfile.profile_picture_content_type};base64,${senderProfile.profile_picture}` : 
                undefined
              }
              sx={{ 
                width: 46, 
                height: 46,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => handleAvatarClick(senderProfile.username)}
            />
          </ListItemAvatar>
          <ListItemText
            primary={senderProfile.username}
            secondary={`${senderProfile.first_name} ${senderProfile.last_name}`}
            sx={{ textAlign: 'left' }}
          />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center'
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleSendFriendRequest}
            disabled={senderProfile.friendship_status === "following" || senderProfile.friendship_status === "request_sent"}
          >
            Follow
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            size="small" 
            onClick={handleAcceptRequest}
          >
            Accept
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            onClick={handleDeclineRequest}
          >
            Decline
          </Button>
        </Box>
      </ListItem>
      {showDivider && <Divider />}
    </Box>
  );
} 