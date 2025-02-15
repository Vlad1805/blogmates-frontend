import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#D87C5A" }, // Terracotta
    secondary: { main: "#F4A261" }, // Peach Orange
    background: { default: "#FAF3E0", paper: "#FFF" }, // Cream + White for cards
    text: { primary: "#3D3D3D", secondary: "#6B6B6B" }, // Dark and soft gray
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default theme;
