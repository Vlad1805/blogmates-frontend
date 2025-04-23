import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "@/components/ProfilePage";
import CreatePostPage from "@/components/CreatePostPage";
function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <div style={{ paddingTop: "64px" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
