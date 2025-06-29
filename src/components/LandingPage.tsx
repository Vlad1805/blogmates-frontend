import { Typography, Box } from "@mui/material";
import typewriterImage from "@/assets/typewriter-red.jpg";
import { Typewriter } from "react-simple-typewriter";


export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundImage: `url(${typewriterImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#ffffff",
        paddingX: 2,
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: "#B22222",
          fontFamily: "'Courier Prime', monospace",
          fontSize: "2rem",
        }}
      >
        <Typewriter
          words={[
            "BlogMates",
            "Your Space to Create.",
            "Write Freely.",
            "Publish Confidently.",
          ]}
          loop={0}
          typeSpeed={70}
          deleteSpeed={40}
          delaySpeed={1500}
        />
      </Typography>
    </Box>
  );
}
