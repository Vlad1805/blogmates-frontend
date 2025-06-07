import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "@/components/ProfilePage";
import CreatePostPage from "@/components/CreatePostPage";
import UserProfilePage from "@/components/UserProfilePage";
import FeedPage from "@/components/FeedPage";
import BlogPostPage from "@/components/BlogPostPage";
import AboutPage from "./components/AboutPage";
import SearchPage from "./components/SearchPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { backgroundColor: '#fdf6e3 !important' },
            body: { backgroundColor: '#fdf6e3 !important' },
            '#root': { backgroundColor: '#fdf6e3 !important', minHeight: '100vh' }
          }}
        />
        <Router>
          <Navbar />
          <div style={{ paddingTop: "64px" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="/profile/:username" element={<UserProfilePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
