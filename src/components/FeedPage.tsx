import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllPosts, CreatePostResponse, getUserProfile, UserDataResponse } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";
import BlogCardComponent from "./BlogCardComponent";

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
              if (post.author_name) {
                const profile = await getUserProfile(post.author_name);
                profiles[post.author_name] = profile;
              }
            } catch (err) {
              console.error(`Failed to fetch profile for ${post.author_name}:`, err);
            }
          }
        }
        setUserProfiles(profiles);
      } catch (err) {
        setError((err as any)?.response?.data?.error || "Failed to load posts");
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
        <Box sx={{ 
          my: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading posts...
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
              <BlogCardComponent
                key={post.id}
                post={post}
                authorProfile={authorProfile}
                expanded={expanded}
                onAvatarClick={handleAvatarClick}
                onToggleExpand={toggleExpand}
                isContentLong={longContent}
                contentToShow={contentToShow}
              />
            );
          })}
          {posts.length === 0 && (
            <Box sx={{ 
              p: 3,
              textAlign: 'center',
              backgroundColor: (theme) => theme.palette.primary.main + '0A',
              border: (theme) => `1px solid ${theme.palette.primary.main}1A`,
              borderRadius: 1
            }}>
              <Typography color="text.secondary">
                No posts yet. Be the first to create one!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
} 