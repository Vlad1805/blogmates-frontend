import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { PostCommentResponse, UserDataResponse, postLikeComment, deleteLikeComment, getCommentLikes, LikesResponse } from "@/api/blogmates-backend";
import { format } from "date-fns";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LikesPopup from "./LikesPopup";

interface CommentComponentProps {
  comment: PostCommentResponse;
  authorProfile?: UserDataResponse;
  onAvatarClick: (username: string) => void;
}

export default function CommentComponent({
  comment,
  authorProfile,
  onAvatarClick
}: CommentComponentProps) {
  const { userData } = useAuth();
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [likes, setLikes] = useState<LikesResponse[]>([]);
  const [showLikesPopup, setShowLikesPopup] = useState(false);

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

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
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
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
          {comment.content}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleLikeClick}
            disabled={isLoadingLike}
            color={isLiked ? "primary" : "default"}
            size="small"
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => setShowLikesPopup(true)}
          >
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Typography>
        </Box>
      </Box>
      <LikesPopup
        open={showLikesPopup}
        onClose={() => setShowLikesPopup(false)}
        likes={likes}
      />
    </Box>
  );
} 