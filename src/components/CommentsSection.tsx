import { Box, Typography } from "@mui/material";
import { PostCommentResponse, UserDataResponse } from "@/api/blogmates-backend";
import CommentComponent from "./CommentComponent";

interface CommentsSectionProps {
  comments: PostCommentResponse[];
  commentProfiles: Record<string, UserDataResponse>;
  commentCount: number;
  onAvatarClick: (username: string) => void;
}

export default function CommentsSection({
  comments,
  commentProfiles,
  commentCount,
  onAvatarClick
}: CommentsSectionProps) {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({commentCount})
        </Typography>
        {comments.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                authorProfile={commentProfiles[comment.author_name]}
                onAvatarClick={onAvatarClick}
              />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Box>
    </>
  );
} 