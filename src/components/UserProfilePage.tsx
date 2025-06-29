import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Container, Typography, Avatar, Paper, Button, CircularProgress, Pagination } from "@mui/material";
import { getUserProfile, UserDataResponse, sendFollowRequest, unfollowUser, getUserPosts, CreatePostResponse } from "@/api/blogmates-backend";
import { useAuth } from "@/context/AuthContext";
import BlogCardComponent from "./BlogCardComponent";

const PREVIEW_CHAR_LIMIT = 300;
const PREVIEW_LINE_LIMIT = 8;

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { userData: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [userPosts, setUserPosts] = useState<CreatePostResponse[]>([]);
  const [postsPagination, setPostsPagination] = useState({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 3,
  });
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

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
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});
  const handleAvatarClick = (username: string) => {
    navigate(`/profile/${username}`);
  };
  const toggleExpand = (postId: number) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      try {
        const data = await getUserProfile(username);
        setUserData(data);
        setError(null);
      } catch (err) {
        setError((err as any)?.response?.data?.error || "Failed to load user profile");
        setUserData(null);
      }
    };

    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!username) return;
      setIsLoadingPosts(true);
      try {
        const response = await getUserPosts(username, postsPagination.currentPage, 3);
        setUserPosts(response.results);
        setPostsPagination({
          count: response.count,
          totalPages: response.total_pages,
          currentPage: response.current_page,
          pageSize: 3,
        });
        setPostsError(null);
      } catch (err: any) {
        setPostsError(err.response?.data?.error || "Failed to load posts");
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchUserPosts();
    // eslint-disable-next-line
  }, [username, postsPagination.currentPage]);

  const handlePostsPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPostsPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleSendFriendRequest = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      await sendFollowRequest(userData.id);
      const updatedData = await getUserProfile(username!);
      setUserData(updatedData);
    } catch (err) {
      console.error("Failed to Follow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollowUser = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      await unfollowUser(userData.id);
      const updatedData = await getUserProfile(username!);
      setUserData(updatedData);
    } catch (err) {
      console.error("Failed to unfollow:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.id === userData.id;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.primary.main + '0A',
          border: (theme) => `1px solid ${theme.palette.primary.main}1A`
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Avatar 
              src={userData.profile_picture ? `data:${userData.profile_picture_content_type};base64,${userData.profile_picture}` : undefined}
              sx={{ 
                width: 150, 
                height: 150,
                border: '4px solid #f5f5f5'
              }} 
            />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {userData.username}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {userData.first_name} {userData.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {userData.email}
              </Typography>
              {userData?.biography && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: (theme) => theme.palette.primary.main + '08',
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.primary.main}15`,
                      maxWidth: '600px',
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        "{userData.biography}"
                      </Typography>
                    </Box>
                  )}
            </Box>

            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                  {userData.follower_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                  {userData.following_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
              </Box>
            </Box>

            {!isOwnProfile && !userData.friendship_status && (
              <Button 
                variant="contained"
                color="primary"
                onClick={handleSendFriendRequest}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Follow"}
              </Button>
            )}
            {!isOwnProfile && userData.friendship_status === "request_sent" && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: (theme) => theme.palette.primary.main + '15',
                padding: '8px 16px',
                borderRadius: '20px',
                border: (theme) => `1px solid ${theme.palette.primary.main}30`
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: 500
                  }}
                >
                  Request Sent
                </Typography>
              </Box>
            )}
            {!isOwnProfile && userData.friendship_status === "following" && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: (theme) => theme.palette.primary.main + '15',
                padding: '8px 16px',
                borderRadius: '20px',
                border: (theme) => `1px solid ${theme.palette.primary.main}30`,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.main + '25'
                }
              }}
              onClick={handleUnfollowUser}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: 500
                  }}
                >
                  Unfollow
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {userData && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Posts
          </Typography>
          {isLoadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : postsError ? (
            <Typography color="error">{postsError}</Typography>
          ) : userPosts.length === 0 ? (
            <Typography color="text.secondary">No posts yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {userPosts.map((post) => {
                const expanded = expandedPosts[post.id] || false;
                const longContent = isContentLong(post.content);
                const contentToShow = expanded || !longContent ? post.content : getPreviewContent(post.content);
                return (
                  <BlogCardComponent
                    key={post.id}
                    post={post}
                    authorProfile={userData}
                    expanded={expanded}
                    onAvatarClick={handleAvatarClick}
                    onToggleExpand={toggleExpand}
                    isContentLong={longContent}
                    contentToShow={contentToShow}
                  />
                );
              })}
              {postsPagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={postsPagination.totalPages}
                    page={postsPagination.currentPage}
                    onChange={handlePostsPageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
