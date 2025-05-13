import { Box, Container, Typography, Paper, Avatar, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllPosts, CreatePostResponse, PostVisibility, getUserProfile, UserDataResponse } from "@/api/blogmates-backend";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const PREVIEW_CHAR_LIMIT = 300;
const PREVIEW_LINE_LIMIT = 8;

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CreatePostResponse[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserDataResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        setError(null);

        // Fetch profiles for all authors
        const profiles: Record<string, UserDataResponse> = {};
        for (const post of fetchedPosts) {
          if (!profiles[post.author_name]) {
            try {
              const profile = await getUserProfile(post.author_name);
              profiles[post.author_name] = profile;
            } catch (err) {
              console.error(`Failed to fetch profile for ${post.author_name}:`, err);
            }
          }
        }
        setUserProfiles(profiles);
      } catch (err) {
        setError("Failed to load posts");
        console.error("Failed to load posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

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

  const isContentLong = (content: string) => {
    const lines = content.split(/\r?\n/);
    return content.length > PREVIEW_CHAR_LIMIT || lines.length > PREVIEW_LINE_LIMIT;
  };

  const getPreviewContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    if (lines.length > PREVIEW_LINE_LIMIT) {
      return lines.slice(0, PREVIEW_LINE_LIMIT).join("\n") + "...";
    }
    if (content.length > PREVIEW_CHAR_LIMIT) {
      return content.slice(0, PREVIEW_CHAR_LIMIT) + "...";
    }
    return content;
  };

  const toggleExpand = (postId: number) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography>Loading posts...</Typography>
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

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Feed
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {posts.map((post) => {
            const authorProfile = userProfiles[post.author_name];
            const expanded = expandedPosts[post.id] || false;
            const longContent = isContentLong(post.content);
            const contentToShow = expanded || !longContent ? post.content : getPreviewContent(post.content);
            return (
              <Paper 
                key={post.id} 
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
                    onClick={() => handleAvatarClick(post.author_name)}
                  >
                    {post.author_name[0].toUpperCase()}
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
                      {post.author_name}
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
                <Typography variant="h5" gutterBottom>
                  {post.title}
                </Typography>
                {longContent && (
                  <Button size="small" sx={{ mb: 1 }} onClick={() => toggleExpand(post.id)}>
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
                {post.updated_at !== post.created_at && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2 }}
                  >
                    Edited {format(new Date(post.updated_at), 'MMM d, yyyy • h:mm a')}
                  </Typography>
                )}
              </Paper>
            );
          })}
          {posts.length === 0 && (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                textAlign: 'center',
                backgroundColor: (theme) => theme.palette.primary.main + '0A',
                border: (theme) => `1px solid ${theme.palette.primary.main}1A`
              }}
            >
              <Typography color="text.secondary">
                No posts yet. Be the first to create one!
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
} 