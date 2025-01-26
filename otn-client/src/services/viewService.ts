import { View } from '../models/View';

export const viewService = {
  getViews: async (): Promise<View[]> => {
    // TODO: Replace with actual API call
    return [
      { 
        id: '1', 
        name: 'Timeline View',
        description: 'Shows events in chronological order',
        configuration: {
          type: 'timeline',
          sortBy: 'timestamp',
          sortDirection: 'desc'
        }
      },
      { 
        id: '2', 
        name: 'List View',
        description: 'Shows events in a detailed list',
        configuration: {
          type: 'list',
          sortBy: 'timestamp',
          sortDirection: 'desc'
        }
      },
    ];
  }
}; 