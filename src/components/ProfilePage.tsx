import { useAuth } from "@/context/AuthContext";
import { Box, Container, Typography, Avatar, Paper, Button, TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { updateUserProfile, getPendingFriendRequests, getUserProfileById, sendFollowRequest, acceptFollowRequest, declineFollowRequest, getFollowers, getFollowing, FollowData } from "@/api/blogmates-backend";
import { PendingRequest } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";
import PendingRequestsList from "./PendingRequestsList";
import { UserDataResponse } from "@/api/blogmates-backend";

interface SenderProfile extends UserDataResponse {
  // Add any additional properties if needed
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userData, setUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [followers, setFollowers] = useState<FollowData[]>([]);
  const [following, setFollowing] = useState<FollowData[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<Record<number, SenderProfile>>({});
  const [followerProfiles, setFollowerProfiles] = useState<Record<number, SenderProfile>>({});
  const [followingProfiles, setFollowingProfiles] = useState<Record<number, SenderProfile>>({});
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    biography: userData?.biography || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const requests = await getPendingFriendRequests();
        setPendingRequests(requests);

        const followers = await getFollowers();
        setFollowers(followers);

        const following = await getFollowing();
        setFollowing(following);
        
        // Fetch sender profiles for each request
        const profiles: Record<number, SenderProfile> = {};
        for (const request of requests) {
          try {
            const profile = await getUserProfileById(request.sender_id);
            profiles[request.sender_id] = profile;
          } catch (error) {
            console.error(`Failed to fetch profile for sender ${request.sender_id}:`, error);
          }
        }
        setSenderProfiles(profiles);

        const followersProfiles: Record<number, SenderProfile> = {};
        for (const follower of followers) {
          try {
            const profile = await getUserProfileById(follower.id);
            followersProfiles[follower.id] = profile;
          } catch (error) {
            console.error(`Failed to fetch profile for follower ${follower.id}:`, error);
          }
        }
        setFollowerProfiles(followersProfiles);

        const followingProfiles: Record<number, SenderProfile> = {};
        for (const f of following) {
          try {
            const profile = await getUserProfileById(f.id);
            followingProfiles[f.id] = profile;
          } catch (error) {
            console.error(`Failed to fetch profile for following ${f.id}:`, error);
          }
        }
        setFollowingProfiles(followingProfiles);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: any = { ...formData };
      
      if (selectedImage) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];
          updateData.profile_picture = base64Data;
          updateData.profile_picture_content_type = selectedImage.type;
          
          const updatedUser = await updateUserProfile(updateData);
          setUserData(updatedUser);
          setIsEditing(false);
        };
      } else {
        const updatedUser = await updateUserProfile(updateData);
        setUserData(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleSendFriendRequest = async (senderId: number) => {
    try {
      await sendFollowRequest(senderId);
      // Refresh sender profiles
      const updatedProfile = await getUserProfileById(senderId);
      setSenderProfiles(prev => ({
        ...prev,
        [senderId]: updatedProfile
      }));
    } catch (err) {
      console.error("Failed to Follow:", err);
    }
  };

  const handleAcceptFollowRequest = async (requestId: number) => {
    try {
      await acceptFollowRequest(requestId);
      // Find the sender ID from the request
      const request = pendingRequests.find(r => r.id === requestId);
      if (request) {
        // Refresh sender profile
        const updatedProfile = await getUserProfileById(request.sender_id);
        setSenderProfiles(prev => ({
          ...prev,
          [request.sender_id]: updatedProfile
        }));

        // Refresh followers list
        const updatedFollowers = await getFollowers();
        setFollowers(updatedFollowers);

        // Fetch profiles for new followers
        const followersProfiles: Record<number, SenderProfile> = {};
        for (const follower of updatedFollowers) {
          try {
            const profile = await getUserProfileById(follower.id);
            followersProfiles[follower.id] = profile;
          } catch (error) {
            console.error(`Failed to fetch profile for follower ${follower.id}:`, error);
          }
        }
        setFollowerProfiles(followersProfiles);

        // Remove the request from pending requests
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error("Failed to Accept Follow Request:", err);
    }
  };

  const handleDeclineFollowRequest = async (requestId: number) => {
    try {
      await declineFollowRequest(requestId);
      // Find the sender ID from the request
      const request = pendingRequests.find(r => r.id === requestId);
      if (request) {
        // Refresh sender profile
        const updatedProfile = await getUserProfileById(request.sender_id);
        setSenderProfiles(prev => ({
          ...prev,
          [request.sender_id]: updatedProfile
        }));

        // Remove the request from pending requests
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error("Failed to Decline Follow Request:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      height: 'calc(100vh - 64px)', // Subtract navbar height
      overflowY: 'auto',
      paddingTop: '16px',
      paddingBottom: '16px',
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none' // IE and Edge
    }}>
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.primary.main + '0A',
          border: (theme) => `1px solid ${theme.palette.primary.main}1A`
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={userData?.profile_picture ? `data:${userData.profile_picture_content_type};base64,${userData.profile_picture}` : undefined}
                sx={{ 
                  width: 150, 
                  height: 150,
                  border: '4px solid #f5f5f5'
                }} 
              />
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <EditIcon />
                </IconButton>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
            </Box>
            
            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Biography"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  margin="normal"
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" type="submit">
                    Save Changes
                  </Button>
                  <Button variant="outlined" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {userData?.username}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {userData?.first_name} {userData?.last_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {userData?.email}
                  </Typography>
                  {userData?.biography && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.primary.main + '08',
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.primary.main}15`,
                      maxWidth: '600px',
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        "{userData.biography}"
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      {userData?.follower_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Followers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      {userData?.following_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Following
                    </Typography>
                  </Box>
                </Box>

                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Box>
        </Paper>

        {pendingRequests.length > 0 && (
          <PendingRequestsList
            pendingRequests={pendingRequests}
            senderProfiles={senderProfiles}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptFollowRequest}
            onDeclineRequest={handleDeclineFollowRequest}
            onSenderProfileUpdate={(id, profile) => {
              setSenderProfiles(prev => ({
                ...prev,
                [id]: profile
              }));
            }}
          />
        )}

        {followers.length > 0 && (
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: 2, 
            mt: 4,
            backgroundColor: (theme) => theme.palette.primary.main + '0A',  
            border: (theme) => `1px solid ${theme.palette.primary.main}1A`
          }}>
            <Typography variant="h5" gutterBottom>
              Followers
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              justifyContent: 'center'
            }}>
              {followers.map((follower) => {
                const followerProfile = followerProfiles[follower.id];
                if (!followerProfile) return null;

                return (
                  <Box>
                    <Avatar 
                      src={followerProfile.profile_picture ? 
                        `data:${followerProfile.profile_picture_content_type};base64,${followerProfile.profile_picture}` : 
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
                      onClick={() => handleAvatarClick(followerProfile.username)}
                    />
                  </Box>
                );
              })} 
            </Box>
          </Paper>  
        )}

        {following.length > 0 && (
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: 2,   
            mt: 4,
            backgroundColor: (theme) => theme.palette.primary.main + '0A',  
            border: (theme) => `1px solid ${theme.palette.primary.main}1A`
          }}>
            <Typography variant="h5" gutterBottom>
              Following
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              justifyContent: 'center'
            }}>
              {following.map((following) => {
                const followingProfile = followingProfiles[following.id];
                if (!followingProfile) return null;

                return (
                  <Box>
                    <Avatar 
                      src={followingProfile.profile_picture ? 
                        `data:${followingProfile.profile_picture_content_type};base64,${followingProfile.profile_picture}` : 
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
                      onClick={() => handleAvatarClick(followingProfile.username)}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}