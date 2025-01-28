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
import FilterService from '../services/filterService';
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
  const [filters, setFilters] = useState<Filter[]>([]);
  const [views, setViews] = useState<View[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [filtersData, viewsData] = await Promise.all([
          FilterService.getFilters(),
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
          paddingTop: '16px',
        },
      }}
    >
      <List sx={{ 
        maxHeight: '50%',
        display: 'flex',
        flexDirection: 'column',
        pb: 1
      }}>
        <ListItem>
          <Typography variant="h6" component="div">
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
        </ListItem>
        <Box sx={{ 
          overflowY: 'auto', 
          maxHeight: 'calc(50vh)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: '1 1 auto',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
          {filters.map((filter) => (
            <ListItem key={filter.id} disablePadding sx={{ py: 0 }}>
              <Tooltip 
                title={filter.text} 
                placement="top"
                TransitionProps={{ style: { marginBottom: '-8px' } }}
              >
                <ListItemButton 
                  onClick={() => handleFilterClick(filter.text)}
                  sx={{ py: 0.25 }}
                >
                  <ListItemText 
                    primary={filter.text} 
                    secondary={filter.lastUsed ? filter.lastUsed.toString().replace('T', ' ').split('.')[0] : ''}
                    sx={{
                      my: 0,
                      '& .MuiListItemText-primary': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '1rem',
                        lineHeight: 1.2
                      },
                      '& .MuiListItemText-secondary': {
                        fontSize: '0.875rem',
                        lineHeight: 1.2
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

      <List sx={{ pt: 0 }}>
        <ListItem>
          <Typography variant="h6" component="div">
            <ViewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Views
          </Typography>
        </ListItem>
        {views.map((view) => (
          <ListItem key={view.id} disablePadding sx={{ py: 0 }}>
            <ListItemButton sx={{ py: 0.25 }}>
              <ListItemText 
                primary={view.name}
                sx={{
                  my: 0,
                  '& .MuiListItemText-primary': {
                    fontSize: '1rem',
                    lineHeight: 1.2
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default LeftDrawer;