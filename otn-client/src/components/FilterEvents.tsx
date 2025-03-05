import React, { useState, Fragment, useEffect } from 'react';
import { TextField, Box, Typography, IconButton, Autocomplete, Switch, FormControlLabel, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventService from '../services/eventService';
import FilterService from '../services/filterService';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface FilterEventsProps {
  resultCount: number;
  onSearch: (searchTerm: string) => void;
  autoRefreshEnabled?: boolean;
  onAutoRefreshChange?: (enabled: boolean) => void;
  predefinedFilters?: string[];
  ref?: React.ForwardedRef<FilterEventsMethods>;
}

export interface FilterEventsMethods {
  setAndSearch: (filter: string, fromDrawer?: boolean) => void;
}

const FilterEvents = React.forwardRef<FilterEventsMethods, FilterEventsProps>(({ 
  resultCount, 
  onSearch, 
  autoRefreshEnabled = true,
  onAutoRefreshChange,
  predefinedFilters = [] 
}, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeNames, setAttributeNames] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [predefinedFiltersList, setPredefinedFiltersList] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showingPredefined, setShowingPredefined] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFromDrawer, setIsFromDrawer] = useState(false);

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
        const filters = await FilterService.getFilterStringsOnly();
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
      const filters = await FilterService.getFilterStringsOnly();
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

  const handleInputChange = (_: React.SyntheticEvent, newValue: string) => {
    setInputValue(newValue || '');
    setSearchTerm(newValue || '');
    setIsFromDrawer(false);
  };

  const currentWord = getCurrentWord(inputValue);
  const matchingOptions = attributeNames.filter(name => 
    name.toLowerCase().includes(currentWord.toLowerCase())
  );
  
  const shouldShow = currentWord.length >= 2;

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    setAndSearch: (filter: string, fromDrawer?: boolean) => {
      // Update both controlled values of Autocomplete
      setSearchTerm(filter);
      setInputValue(filter);
      
      // Set the fromDrawer flag
      setIsFromDrawer(!!fromDrawer);
      
      // Close dropdowns
      setDropdownOpen(false);
      setShowingPredefined(false);
      
      // Trigger search directly
      onSearch(encodeURIComponent(filter));
      refreshPredefinedFilters();
    }
  }));

  return (
    <Fragment>
      <Box display="flex" alignItems="center" marginTop="12px">
        <Autocomplete
          freeSolo
          options={showingPredefined ? predefinedFiltersList : matchingOptions}
          open={isFromDrawer ? false : (showingPredefined ? dropdownOpen : (shouldShow && matchingOptions.length > 0))}
          value={searchTerm}
          inputValue={inputValue}
          onOpen={() => {
            if (showingPredefined) {
              setDropdownOpen(true);
            }
          }}
          onClose={() => {
            setDropdownOpen(false);
            setShowingPredefined(false);
          }}
          onChange={(_, newValue) => {
            if (newValue) {
              if (showingPredefined) {
                setSearchTerm(newValue);
                setInputValue(newValue);
                onSearch(encodeURIComponent(newValue));
                refreshPredefinedFilters();
              } else {
                const updatedValue = replaceLastWord(searchTerm, newValue);
                setSearchTerm(updatedValue);
                setInputValue(updatedValue);
              }
            }
          }}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.toString()}
          filterOptions={(options, params) => {
            if (showingPredefined) {
              return options.filter(option =>
                option.toLowerCase().includes(params.inputValue.toLowerCase())
              );
            }
            return matchingOptions;
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
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      position: 'absolute',
                      right: 0
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowingPredefined(prev => !prev);
                        setDropdownOpen(true);
                      }}
                      tabIndex={-1}
                    >
                      <ArrowDropDownIcon />
                    </IconButton>
                    {searchTerm && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                        tabIndex={-1}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                ),
              }}
              sx={{ 
                '& .MuiAutocomplete-endAdornment': {
                  position: 'relative',
                  right: 0
                },
                '& .MuiInputBase-root': {
                  paddingRight: '8px'
                }
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
});

export default FilterEvents;