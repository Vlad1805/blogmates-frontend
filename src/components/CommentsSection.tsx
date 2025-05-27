import { Box, Typography } from "@mui/material";
import { PostCommentResponse, UserDataResponse } from "@/api/blogmates-backend";
import CommentComponent from "./CommentComponent";

interface CommentsSectionProps {
  comments: PostCommentResponse[];
  commentProfiles: Record<string, UserDataResponse>;
  commentCount: number;
  onAvatarClick: (username: string) => void;
  onCommentDeleted: () => void;
  postId: number;
}

export default function CommentsSection({
  comments,
  commentProfiles,
  commentCount,
  onAvatarClick,
  onCommentDeleted,
  postId
}: CommentsSectionProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({commentCount})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {comments.map((comment) => (
          <CommentComponent
            key={comment.id}
            comment={comment}
            authorProfile={commentProfiles[comment.author_name]}
            onAvatarClick={onAvatarClick}
            onCommentDeleted={onCommentDeleted}
            postId={postId}
          />
        ))}
      </Box>
    </Box>
  );
} 