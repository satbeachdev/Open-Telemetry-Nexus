export interface FilterCriteria {
  field?: string;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value?: any;
  // Add other criteria properties as needed
}

export interface Filter {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria;
  createdAt?: Date;
  updatedAt?: Date;
} 