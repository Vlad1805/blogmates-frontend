import { Box, Typography, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { PostCommentResponse, UserDataResponse, postLikeComment, deleteLikeComment, getCommentLikes, LikesResponse, deleteComment } from "@/api/blogmates-backend";
import { format } from "date-fns";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LikesPopup from "./LikesPopup";

interface CommentComponentProps {
  comment: PostCommentResponse;
  authorProfile: UserDataResponse | null;
  onAvatarClick: (username: string) => void;
  onCommentDeleted: () => void;
  postId: number;
}

export default function CommentComponent({ comment, authorProfile, onAvatarClick, onCommentDeleted, postId }: CommentComponentProps) {
  const { userData } = useAuth();
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [likes, setLikes] = useState<LikesResponse[]>([]);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likesResponse = await getCommentLikes(comment.id);
        setLikes(likesResponse);
        setLikeCount(likesResponse.length);
        setIsLiked(likesResponse.some(like => like.user === userData?.id));
      } catch (error) {
        console.error("Failed to fetch comment likes:", error);
      }
    };

    if (userData?.id) {
      fetchLikes();
    }
  }, [comment.id, userData?.id]);

  const handleLikeClick = async () => {
    if (isLoadingLike) return;
    
    setIsLoadingLike(true);
    try {
      if (isLiked) {
        await deleteLikeComment(comment.id);
        setLikeCount(prev => prev - 1);
      } else {
        await postLikeComment(comment.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteComment(comment.id, postId);
      onCommentDeleted();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Avatar 
        src={authorProfile?.profile_picture ? 
          `data:${authorProfile.profile_picture_content_type};base64,${authorProfile.profile_picture}` : 
          undefined
        }
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8
          }
        }}
        onClick={() => onAvatarClick(comment.author_name)}
      >
        {comment.author_name ? comment.author_name[0].toUpperCase() : ''}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => onAvatarClick(comment.author_name)}
          >
            {comment.author_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
          </Typography>
          {userData?.id === comment.author && (
            <IconButton
              color="error"
              onClick={handleDeleteClick}
              size="small"
              sx={{ ml: 'auto' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {comment.content}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleLikeClick}
            disabled={isLoadingLike}
            color={isLiked ? "primary" : "default"}
            size="small"
          >
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Typography>
        </Box>
      </Box>
      <LikesPopup
        open={showLikesPopup}
        onClose={() => setShowLikesPopup(false)}
        likes={likes}
      />
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 