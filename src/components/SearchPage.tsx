import { useState } from "react";
import { Box, Container, Typography, TextField, Button, CircularProgress, Pagination, List, ListItemText, ListItemButton, Avatar, ListItemAvatar } from "@mui/material";
import { search, SearchResponse, CreatePostResponse } from "@/api/blogmates-backend";
import { useNavigate } from "react-router-dom";
import BlogResultComponent from "./BlogResultComponent";

const PAGE_SIZE_POSTS = 3;
const PAGE_SIZE_USERS = 11;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const navigate = useNavigate();

  const handleSearch = async (postsPageNum = 1, usersPageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await search(query, usersPageNum, PAGE_SIZE_USERS, postsPageNum, PAGE_SIZE_POSTS); // We'll use the same page for both, backend should support separate if needed
      setResults(res);
    } catch (err: any) {
      setError(err.response?.data?.error || "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostsPage(1);
    setUsersPage(1);
    handleSearch(1, 1);
  };

  const handlePostsPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPostsPage(value);
    handleSearch(value, usersPage);
  };

  const handleUsersPageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setUsersPage(value);
    handleSearch(postsPage, value);
  };

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom>Search</Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 2, marginBottom: 24 }}>
            <TextField
              label="Search for users or posts"
              value={query}
              onChange={e => setQuery(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button type="submit" variant="contained" color="primary" disabled={isLoading || !query.trim()}>
              Search
            </Button>
          </form>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
          )}
        </Box>
      </Container>
      {results && !isLoading && !error && (
        (results.blog_entries?.results?.length > 0 || results.users?.results?.length > 0) ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: 'flex-start',
              width: '100%',
              px: { xs: 2, md: 6 },
              mt: 2,
              justifyContent:
                (!results.blog_entries?.results?.length && results.users?.results?.length)
                  || (results.blog_entries?.results?.length && !results.users?.results?.length)
                  ? 'center'
                  : 'flex-start',
            }}
          >
            {/* Posts Section (left) */}
            {results.blog_entries?.results?.length > 0 && (
              <Box sx={{ flex: 2, minWidth: 0, maxWidth: results.users?.results?.length ? undefined : 700 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Posts</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {results.blog_entries.results.map((post: CreatePostResponse) => (
                    <BlogResultComponent
                      key={post.id}
                      post={post}
                    />
                  ))}
                </Box>
                {results.blog_entries.total_pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={results.blog_entries.total_pages}
                      page={postsPage}
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

            {/* Users Section (right) */}
            {results.users?.results?.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 0, maxWidth: results.blog_entries?.results?.length ? undefined : 400 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Users</Typography>
                <List sx={{ mt: 2, gap: 0.6, display: 'flex', flexDirection: 'column' }}>
                  {results.users.results.map((user) => (
                    <ListItemButton
                      key={user.username}
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {user.profile_picture ? (
                            <img
                              src={`data:${user.profile_picture_content_type};base64,${user.profile_picture}`}
                              alt={user.username}
                              style={{ width: 40, height: 40 }}
                            />
                          ) : (
                            user.username[0].toUpperCase()
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.username}
                        secondary={user.email}
                      />
                    </ListItemButton>
                  ))}
                </List>
                {results.users.total_pages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={results.users.total_pages}
                      page={usersPage}
                      onChange={handleUsersPageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary">No results found.</Typography>
          </Box>
        )
      )}
    </>
  );
} 