import { Box, TextField, Button, Alert } from "@mui/material";
import { useState } from "react";
import { postComment, PostCommentResponse } from "@/api/blogmates-backend";
import { useAuth } from "../context/AuthContext";

interface CommentInputProps {
  postId: number;
  onCommentPosted: (comment: PostCommentResponse) => void;
}

export default function CommentInput({ postId, onCommentPosted }: CommentInputProps) {
  const { userData } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await postComment(postId, { content: content.trim() });
      setContent("");
      onCommentPosted(newComment);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setError(null);
  };

  if (!userData) {
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Alert severity="info">
          Please log in to post comments
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        error={!!error}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {content.trim() && (
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            size="small"
            sx={{ 
              borderRadius: '20px',
              minWidth: '100px'
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          size="small"
          sx={{ 
            borderRadius: '20px',
            minWidth: '100px'
          }}
        >
          {isSubmitting ? "Posting..." : "Comment"}
        </Button>
      </Box>
    </Box>
  );
} 