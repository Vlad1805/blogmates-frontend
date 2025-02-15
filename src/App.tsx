import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import theme from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <div style={{ paddingTop: "64px" }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
            <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
            <Route path="/signup" element={<div>Sign Up Page (Coming Soon)</div>} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
