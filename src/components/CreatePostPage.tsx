import { Box, Container, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { useState } from "react";
import { createPost, PostVisibility } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      setIsLoading(false);
      return;
    }

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        visibility
      });
      navigate("/feed");
    } catch (err: any) {
      console.log('Full error:', err);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Failed to create post. Please try again.";
      
      setError(errorMessage);
      console.error("Failed to create post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            fullWidth
            required
            error={!!error && !title.trim()}
            helperText={error && !title.trim() ? "Title is required" : ""}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            multiline
            rows={6}
            fullWidth
            required
            error={!!error && !content.trim()}
            helperText={error && !content.trim() ? "Content is required" : ""}
          />
          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={visibility}
              label="Visibility"
              onChange={(e) => setVisibility(e.target.value as PostVisibility)}
            >
              <MenuItem value={PostVisibility.PUBLIC}>Public</MenuItem>
              <MenuItem value={PostVisibility.FRIENDS}>Friends Only</MenuItem>
              <MenuItem value={PostVisibility.JOURNAL}>Journal</MenuItem>
            </Select>
          </FormControl>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Post"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}