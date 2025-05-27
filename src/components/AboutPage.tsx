import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';

export default function AboutPage() {
  const features = [
    {
      icon: <EditIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Create & Share",
      description: "Write and share your thoughts with the world. Choose who sees your posts with our flexible visibility options."
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Connect",
      description: "Follow other writers, build your network, and engage with the community through comments and likes."
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Engage",
      description: "Interact with posts through likes and comments. Show appreciation for content you enjoy."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: "Privacy Control",
      description: "Control who sees your content with our three visibility levels: Public, Friends, and Journal."
    }
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Welcome to BlogMates
        </Typography>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 6,
            backgroundColor: (theme) => theme.palette.primary.main + '0A',
            border: (theme) => `1px solid ${theme.palette.primary.main}1A`,
            borderRadius: 2
          }}
        >
          <Typography variant="h5" gutterBottom>
            Your Personal Blogging Platform
          </Typography>
          <Typography variant="body1" paragraph>
            BlogMates is a blogging platform designed to help you share your thoughts, connect with others, 
            and build your online presence. Whether you're a seasoned writer or just starting out, our platform 
            provides the tools you need to express yourself and engage with a community of like-minded individuals.
          </Typography>
          <Typography variant="body1" paragraph>
            This is a diploma project created by <b>Vlad Stanciu</b>, 
            a student at <b>POLITEHNICA UNIVERSITY OF BUCHAREST</b>. Please be aware that this is a work in progress and may contain bugs.
            Do not post personal information or sensitive data. If you find any bugs, please report them at vladstanciu18@gmail.com or message me at 
            0728050001.
          </Typography>
          <Typography variant="body1">
            Join us today and start your blogging journey. Share your stories, connect with others, and be part 
            of a growing community of writers and readers.
          </Typography>
        </Paper>

        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Key Features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: (theme) => theme.palette.primary.main + '0A',
                  border: (theme) => `1px solid ${theme.palette.primary.main}1A`,
                  borderRadius: 2
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} BlogMates. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 