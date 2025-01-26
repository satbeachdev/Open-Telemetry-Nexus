import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ViewIcon from '@mui/icons-material/ViewList';
import FilterIcon from '@mui/icons-material/FilterAlt';
import { filterService } from '../services/filterService';
import { viewService } from '../services/viewService';
import Typography from '@mui/material/Typography';
import { Filter } from '../models/Filter';
import { View } from '../models/View';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

interface LeftDrawerProps {
  open: boolean;
  drawerWidth: number;
  onFilterSelect?: (filter: string) => void;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ open, drawerWidth, onFilterSelect }) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [views, setViews] = useState<View[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [filtersData, viewsData] = await Promise.all([
          filterService.getFilters(),
          viewService.getViews()
        ]);
        setFilters(filtersData);
        setViews(viewsData);
      } catch (error) {
        console.error('Error loading filters or views:', error);
      }
    };

    loadData();
  }, []);

  const handleFilterClick = (filter: string) => {
    if (onFilterSelect) {
      onFilterSelect(filter);
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      
      <List sx={{ 
        maxHeight: '50%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ListItem>
          <Typography variant="h6" component="div">
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
        </ListItem>
        <Box sx={{ 
          overflowY: 'auto', 
          maxHeight: 'calc(50vh - 148px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: '1 1 auto',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
          {filters.map((filter) => (
            <ListItem key={filter} disablePadding>
              <Tooltip 
                title={filter} 
                placement="top"
                TransitionProps={{ style: { marginBottom: '-8px' } }}
              >
                <ListItemButton onClick={() => handleFilterClick(filter)}>
                  <ListItemText 
                    primary={filter} 
                    sx={{
                      '& .MuiListItemText-primary': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </Box>
      </List>

      <Divider />

      <List>
        <ListItem>
          <Typography variant="h6" component="div">
            <ViewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Views
          </Typography>
        </ListItem>
        {views.map((view) => (
          <ListItem key={view.id} disablePadding>
            <ListItemButton>
              <ListItemText primary={view.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default LeftDrawer;