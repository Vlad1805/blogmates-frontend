import { useAuth } from "@/context/AuthContext";
import { Box, Container, Typography, Avatar, Paper, Button, TextField, IconButton } from "@mui/material";
import { useState, useRef } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { updateUserProfile } from "@/api/blogmates-backend";

export default function ProfilePage() {
  const { userData, setUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userData?.profile_picture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      {userData?.followers_count || 0}
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
      </Box>
    </Container>
  );
}