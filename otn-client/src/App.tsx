import React, { useState, useMemo, createContext } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Tabs, Tab, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LeftDrawer from './components/leftDrawer';
import RightDrawer from './components/rightDrawer';
import EventList from './components/EventList';
import Footer from './components/footer';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';

export const ThemeContext = createContext<'light' | 'dark'>('light');

const drawerWidth = 240;

const App: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleLeftDrawerToggle = () => {
    setLeftOpen(!leftOpen);
  };

  const handleRightDrawerToggle = () => {
    setRightOpen(!rightOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeContext.Provider value={mode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ 
              minHeight: '32px !important',
              height: '32px',
              padding: '0 16px', // Adjust horizontal padding if needed
            }}>
              <IconButton
                color="inherit"
                aria-label="open left drawer"
                edge="start"
                onClick={handleLeftDrawerToggle}
                sx={{ mr: 2, padding: '4px' }} // Reduce padding to fit smaller height
              >
                <MenuIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" noWrap component="div" sx={{ flexGrow: 1 }}>
                OpenTelemetry Nexus
              </Typography>
              <IconButton sx={{ ml: 1, padding: '4px' }} onClick={toggleTheme} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="open right drawer"
                edge="end"
                onClick={handleRightDrawerToggle}
                sx={{ padding: '4px' }} // Reduce padding to fit smaller height
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            <LeftDrawer open={leftOpen} drawerWidth={drawerWidth} />
            <Box component="main" sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              transition: theme => theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              marginLeft: `-${drawerWidth}px`,
              ...(leftOpen && {
                transition: theme => theme.transitions.create('margin', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                marginLeft: 0,
              }),
              marginRight: `-${drawerWidth}px`,
              ...(rightOpen && {
                marginRight: 0,
              }),
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="event tabs"
                sx={{ 
                  width: '100%',
                  transition: theme => theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
                }}
              >
                <Tab label="Events 1" />
                <Tab label="Events 2" />
              </Tabs>
              <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative', margin: '10px' }}>
                {tabValue === 0 && <EventList />}
                {tabValue === 1 && <EventList />}
              </Box>
            </Box>
            <RightDrawer open={rightOpen} drawerWidth={drawerWidth} />
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default App;