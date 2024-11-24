import React, { useState, Fragment, useEffect } from 'react';
import { Button, TextField, Box, Typography, IconButton, Autocomplete, Switch, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventService from '../eventService';

interface FilterEventsProps {
  resultCount: number;
  onSearch: (searchTerm: string) => void;
  autoRefreshEnabled?: boolean;
  onAutoRefreshChange?: (enabled: boolean) => void;
}

const FilterEvents: React.FC<FilterEventsProps> = ({ 
  resultCount, 
  onSearch, 
  autoRefreshEnabled = true,
  onAutoRefreshChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attributeNames, setAttributeNames] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

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

  const getCurrentWord = (text: string) => {
    const words = text.split(' ');
    return words[words.length - 1];
  };

  const replaceLastWord = (fullText: string, newWord: string) => {
    const words = fullText.split(' ');
    words[words.length - 1] = newWord;
    return words.join(' ');
  };

  const handleSearch = () => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    onSearch(encodedSearchTerm);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
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

  return (
    <Fragment>
      <Box display="flex" alignItems="center" marginTop="12px">
        <Autocomplete
          freeSolo
          options={shouldShow ? matchingOptions : []}
          open={shouldShow && matchingOptions.length > 0}
          value={searchTerm}
          onChange={(_, newValue) => {
            if (newValue) {
              setSearchTerm(replaceLastWord(searchTerm, newValue));
            }
            setIsMonitoring(false);
          }}
          onInputChange={handleInputChange}
          onClose={() => setIsMonitoring(false)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Search" 
              variant="outlined" 
              size="small"
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
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
