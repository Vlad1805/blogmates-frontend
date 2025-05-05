import { Typography, Paper, List } from "@mui/material";
import { PendingRequest, UserDataResponse } from "@/api/blogmates-backend";
import PendingRequestItem from "./PendingRequestItem";

interface PendingRequestsListProps {
  pendingRequests: PendingRequest[];
  senderProfiles: Record<number, UserDataResponse>;
  onSendFriendRequest: (id: number) => void;
  onAcceptRequest: (id: number) => void;
  onDeclineRequest: (id: number) => void;
  onSenderProfileUpdate: (id: number, profile: UserDataResponse) => void;
}

export default function PendingRequestsList({ 
  pendingRequests, 
  senderProfiles,
  onSendFriendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onSenderProfileUpdate
}: PendingRequestsListProps) {
  if (pendingRequests.length === 0) return null;

  const handleProfileUpdate = (id: number, profile: UserDataResponse) => {
    onSenderProfileUpdate(id, profile);
  };

  return (
    <Paper elevation={3} sx={{ 
      p: 4, 
      borderRadius: 2, 
      mt: 4,
      backgroundColor: (theme) => theme.palette.primary.main + '0A',
      border: (theme) => `1px solid ${theme.palette.primary.main}1A`
    }}>
      <Typography variant="h5" gutterBottom>
        Pending Follow Requests
      </Typography>
      <List>
        {pendingRequests.map((request, index) => {
          const senderProfile = senderProfiles[request.sender_id];
          if (!senderProfile) return null;

          return (
            <PendingRequestItem
              key={request.id}
              id={request.id}
              senderProfile={senderProfile}
              onSendFriendRequest={onSendFriendRequest}
              onAcceptRequest={onAcceptRequest}
              onDeclineRequest={onDeclineRequest}
              showDivider={index < pendingRequests.length - 1}
              onProfileUpdate={(profile) => handleProfileUpdate(request.sender_id, profile)}
            />
          );
        })}
      </List>
    </Paper>
  );
} 