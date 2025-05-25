import { Box, Container, Typography, CircularProgress, Avatar, Chip, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, CreatePostResponse, PostVisibility, getUserProfile, UserDataResponse, getBlogLikes, postBlogLike, deleteBlogLike, LikesResponse, getCommentsCount, getComments, PostCommentResponse } from "@/api/blogmates-backend";
import { format } from "date-fns";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import { useAuth } from "../context/AuthContext";
import LikesPopup from "./LikesPopup";
import CommentsSection from "./CommentsSection";
import CommentInput from "./CommentInput";

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

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [post, setPost] = useState<CreatePostResponse | null>(null);
  const [authorProfile, setAuthorProfile] = useState<UserDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [likes, setLikes] = useState<LikesResponse[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [comments, setComments] = useState<PostCommentResponse[]>([]);
  const [commentProfiles, setCommentProfiles] = useState<Record<string, UserDataResponse>>({});

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postId = parseInt(id);
        const fetchedPost = await getPostById(postId);
        setPost(fetchedPost);
        setError(null);

        // Fetch author profile
        if (fetchedPost.author_name) {
          try {
            const profile = await getUserProfile(fetchedPost.author_name);
            setAuthorProfile(profile);
          } catch (err) {
            console.error(`Failed to fetch profile for ${fetchedPost.author_name}:`, err);
          }
        }

        // Fetch likes and comments count
        if (userData?.id) {
          const [likes, commentsResponse] = await Promise.all([
            getBlogLikes(postId),
            getCommentsCount(postId)
          ]);
          setLikes(likes);
          setLikeCount(likes.length);
          setCommentCount(commentsResponse.comment_count);
          setIsLiked(likes.some(like => like.user === userData.id));
        }

        // Fetch comments
        const fetchedComments = await getComments(postId);
        setComments(fetchedComments);

        // Fetch profiles for all comment authors
        const profiles: Record<string, UserDataResponse> = {};
        for (const comment of fetchedComments) {
          if (!profiles[comment.author_name]) {
            try {
              const profile = await getUserProfile(comment.author_name);
              profiles[comment.author_name] = profile;
            } catch (err) {
              console.error(`Failed to fetch profile for ${comment.author_name}:`, err);
            }
          }
        }
        setCommentProfiles(profiles);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load post");
        console.error("Failed to load post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, userData?.id]);

  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleLikeClick = async () => {
    if (isLoadingLike || !post) return;
    
    setIsLoadingLike(true);
    try {
      if (isLiked) {
        await deleteBlogLike(post.id);
        setLikeCount(prev => prev - 1);
      } else {
        await postBlogLike(post.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleNewComment = async (newComment: PostCommentResponse) => {
    // Add the new comment to the list
    setComments(prev => [newComment, ...prev]);
    
    // Update comment count
    setCommentCount(prev => prev + 1);

    // Fetch the author's profile
    try {
      const profile = await getUserProfile(newComment.author_name);
      setCommentProfiles(prev => ({
        ...prev,
        [newComment.author_name]: profile
      }));
    } catch (err) {
      console.error(`Failed to fetch profile for ${newComment.author_name}:`, err);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ 
          my: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading post...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography color="error">Post not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
            onClick={() => handleAvatarClick(post.author_name)}
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
              onClick={() => handleAvatarClick(post.author_name)}
            >
              {post.author_name ? post.author_name : 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
            </Typography>
          </Box>
          <Chip 
            label={post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)} 
            size="small"
            color={getVisibilityColor(post.visibility)}
            sx={{ ml: 'auto' }}
          />
        </Box>
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          {post.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton 
            onClick={handleLikeClick}
            disabled={isLoadingLike}
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
            <Typography variant="body2" color="text.secondary">
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            fontSize: '1.1rem',
            color: 'text.primary',
            mb: 4
          }}
        >
          {post.content}
        </Typography>
        {post.updated_at !== post.created_at && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: 'block', mb: 4 }}
          >
            Edited {format(new Date(post.updated_at), 'MMM d, yyyy • h:mm a')}
          </Typography>
        )}
        <CommentInput
          postId={post.id}
          onCommentPosted={handleNewComment}
        />
        <CommentsSection
          comments={comments}
          commentProfiles={commentProfiles}
          commentCount={commentCount}
          onAvatarClick={handleAvatarClick}
        />
        <LikesPopup
          open={showLikesPopup}
          onClose={() => setShowLikesPopup(false)}
          likes={likes}
        />
      </Box>
    </Container>
  );
} 