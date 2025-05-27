import { Box, Paper, Avatar, Typography, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { format } from "date-fns";
import { CreatePostResponse, PostVisibility, UserDataResponse, getBlogLikes, postBlogLike, deleteBlogLike, LikesResponse, getCommentsCount, deletePostById } from "@/api/blogmates-backend";
import { useEffect, useState } from "react";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "../context/AuthContext";
import LikesPopup from "./LikesPopup";
import { useNavigate } from "react-router-dom";

interface BlogCardProps {
  post: CreatePostResponse;
  authorProfile?: UserDataResponse;
  expanded: boolean;
  onAvatarClick: (username: string) => void;
  onToggleExpand: (postId: number) => void;
  isContentLong: boolean;
  contentToShow: string;
  onPostDeleted?: () => void;
}

const getVisibilityColor = (visibility: PostVisibility) => {
  switch (visibility) {
    case PostVisibility.PUBLIC:
      return "success";
    case PostVisibility.FRIENDS:
      return "primary";
    case PostVisibility.JOURNAL:
      return "secondary";
    default:
      return "default";
  }
};

export default function BlogCardComponent({
  post,
  authorProfile,
  expanded,
  onAvatarClick,
  onToggleExpand,
  isContentLong,
  contentToShow,
  onPostDeleted
}: BlogCardProps) {
  const { userData } = useAuth();
  const [likeCount, setLikeCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [likes, setLikes] = useState<LikesResponse[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        console.log('Fetching counts for post:', post.id);
        const [likes, commentsResponse] = await Promise.all([
          getBlogLikes(post.id),
          getCommentsCount(post.id)
        ]);
        setLikes(likes);
        setLikeCount(likes.length);
        setCommentCount(commentsResponse.comment_count);
        if (userData?.id) {
          setIsLiked(likes.some(like => like.user === userData.id));
        }
        setError(null);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
        setError((error as any)?.response?.data?.error || "Failed to load counts");
      }
    };

    fetchCounts();
  }, [post.id, userData?.id]);

  const handleLikeClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      if (isLiked) {
        console.log('Unliking post:', post.id);
        await deleteBlogLike(post.id);
        setLikeCount(prev => prev - 1);
      } else {
        console.log('Liking post:', post.id);
        await postBlogLike(post.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setError((error as any)?.response?.data?.error || "Failed to update like");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deletePostById(post.id);
      onPostDeleted?.();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!post) {
    console.error('Post is undefined in BlogCardComponent');
    return null;
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        backgroundColor: (theme) => theme.palette.primary.main + '0A',
        border: (theme) => `1px solid ${theme.palette.primary.main}1A`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
          onClick={() => onAvatarClick(post.author_name)}
        >
          {post.author_name ? post.author_name[0].toUpperCase() : ''}
        </Avatar>
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => onAvatarClick(post.author_name)}
          >
            {post.author_name ? post.author_name : 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)} 
            size="small"
            color={getVisibilityColor(post.visibility)}
          />
          {userData?.id === post.author && (
            <IconButton
              color="error"
              onClick={handleDeleteClick}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
        onClick={() => navigate(`/blog/${post.id}`)}
      >
        {post.title}
      </Typography>
      {isContentLong && (
        <Button size="small" sx={{ mb: 1 }} onClick={() => onToggleExpand(post.id)}>
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
      <Typography 
        variant="body1" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6
        }}
      >
        {contentToShow}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
        <IconButton 
          onClick={handleLikeClick}
          disabled={isLoading}
          color={isLiked ? "primary" : "default"}
          size="small"
        >
          {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => setShowLikesPopup(true)}
        >
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <CommentIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 0.5 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate(`/blog/${post.id}`)}
          >
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </Typography>
        </Box>
        {error && (
          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
      <LikesPopup
        open={showLikesPopup}
        onClose={() => setShowLikesPopup(false)}
        likes={likes}
      />
      {post.updated_at !== post.created_at && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          Edited {format(new Date(post.updated_at), 'MMM d, yyyy • h:mm a')}
        </Typography>
      )}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
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
    </Paper>
  );
} 