import { Box, Container, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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

    try {
      await createPost({
        title,
        content,
        visibility
      });
      navigate("/profile"); // Redirect to profile after successful creation
    } catch (err) {
      setError("Failed to create post. Please try again.");
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
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            required
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