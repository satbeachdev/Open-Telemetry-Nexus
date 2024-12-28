import React, { useState, Fragment, useEffect } from 'react';
import { Button, TextField, Box, Typography, IconButton, Autocomplete, Switch, FormControlLabel, MenuItem, Select } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventService from '../eventService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface FilterEventsProps {
  resultCount: number;
  onSearch: (searchTerm: string) => void;
  autoRefreshEnabled?: boolean;
  onAutoRefreshChange?: (enabled: boolean) => void;
  predefinedFilters?: string[];
}

const FilterEvents: React.FC<FilterEventsProps> = ({ 
  resultCount, 
  onSearch, 
  autoRefreshEnabled = true,
  onAutoRefreshChange,
  predefinedFilters = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeNames, setAttributeNames] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [predefinedFiltersList, setPredefinedFiltersList] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [showingPredefined, setShowingPredefined] = useState(false);

  useEffect(() => {
    const loadAttributeNames = async () => {
      try {
        const names = await EventService.LoadUniqueAttributeNames2();
        setAttributeNames(names);
      } catch (error) {
        console.error('Failed to load attribute names:', error);
      }
    };

    loadAttributeNames();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const loadPredefinedFilters = async () => {
      try {
        const filters = await EventService.LoadPredefinedFilters();
        setPredefinedFiltersList(filters);
      } catch (error) {
        console.error('Failed to load predefined filters:', error);
      }
    };

    loadPredefinedFilters();
  }, []);

  const getCurrentWord = (text: string) => {
    const words = text.split(' ');
    return words[words.length - 1];
  };

  const replaceLastWord = (fullText: string, newWord: string) => {
    const words = fullText.split(' ');
    words[words.length - 1] = newWord;
    return words.join(' ');
  };

  const refreshPredefinedFilters = async () => {
    try {
      const filters = await EventService.LoadPredefinedFilters();
      setPredefinedFiltersList(filters);
    } catch (error) {
      console.error('Failed to refresh predefined filters:', error);
    }
  };

  const handleSearch = async () => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    onSearch(encodedSearchTerm);
    await refreshPredefinedFilters();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isSelecting) {
      handleSearch();
    }
  };

  const handleClear = async () => {
    setSearchTerm('');
    onSearch('');
    await refreshPredefinedFilters();
  };

  const handleInputChange = (_: any, newValue: string) => {
    setSearchTerm(newValue);
    if (!isMonitoring) {
      setIsMonitoring(true);
    }
  };

  const currentWord = getCurrentWord(searchTerm);
  const matchingOptions = attributeNames.filter(name => 
    name.toLowerCase().includes(currentWord.toLowerCase())
  );
  
  const shouldShow = isMonitoring && currentWord.length >= 2;

  const insertAtCursor = (text: string, cursorPosition: number, insertion: string): string => {
    return text.slice(0, cursorPosition) + insertion + text.slice(cursorPosition);
  };

  return (
    <Fragment>
      <Box display="flex" alignItems="center" marginTop="12px">
        <Autocomplete
          freeSolo
          options={showingPredefined ? predefinedFiltersList : matchingOptions}
          open={(showingPredefined && dropdownOpen) || (!showingPredefined && shouldShow && matchingOptions.length > 0)}
          value={searchTerm}
          onOpen={() => {
            if (showingPredefined) {
              setDropdownOpen(true);
            }
          }}
          onClose={() => {
            setDropdownOpen(false);
            setShowingPredefined(false);
            if (!shouldShow) {
              setIsMonitoring(false);
            }
          }}
          onChange={(_, newValue) => {
            if (newValue) {
              if (showingPredefined) {
                setSearchTerm(newValue);
                // Auto-submit when selecting a predefined filter
                setTimeout(() => {
                  onSearch(encodeURIComponent(newValue));
                  refreshPredefinedFilters();
                }, 0);
              } else {
                setSearchTerm(replaceLastWord(searchTerm, newValue));
              }
              setIsMonitoring(false);
              setTimeout(() => setIsSelecting(false), 100);
            }
          }}
          onInputChange={handleInputChange}
          onHighlightChange={(event, option) => {
            setIsSelecting(option !== null);
          }}
          renderInput={(params) => (
            <TextField 
              {...params}
              label="Search" 
              variant="outlined" 
              size="small"
              onKeyDown={handleKeyPress}
              autoComplete="off"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {params.InputProps.endAdornment}
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowingPredefined(true);
                        setDropdownOpen(true);
                        setIsMonitoring(false);
                      }}
                      sx={{ mr: -1 }}
                    >
                      <ArrowDropDownIcon />
                    </IconButton>
                  </React.Fragment>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <MenuItem {...props}>
              {option}
            </MenuItem>
          )}
          disablePortal
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          style={{ marginLeft: '8px', width: '80px' }}
        >
          Submit
        </Button>
        <IconButton
          onClick={handleClear}
          style={{
            marginLeft: '8px',
            borderRadius: '4px',
            padding: '6px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
          }}
          aria-label="clear search"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box mt={1} display="flex" alignItems="center">
        <Typography variant="body1">{resultCount} events</Typography>
        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefreshEnabled}
                onChange={(e) => onAutoRefreshChange?.(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
            sx={{ mr: 0 }}
          />
        </Box>
      </Box>
    </Fragment>
  );
};

export default FilterEvents;
