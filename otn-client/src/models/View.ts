export interface ViewConfiguration {
  type: 'timeline' | 'list' | 'grid';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  groupBy?: string;
  // Add other configuration properties as needed
}

export interface View {
  id: string;
  name: string;
  description?: string;
  configuration: ViewConfiguration;
  createdAt?: Date;
  updatedAt?: Date;
} 