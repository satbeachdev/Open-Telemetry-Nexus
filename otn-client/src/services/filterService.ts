import axios, { AxiosRequestConfig } from 'axios';
import { Filter } from '../models/Filter';

export const filterService = {
    getFilters: async (): Promise<string[]> => {
        try {
            const response = await axios.get('http://localhost:8000/filters'); 
            return response.data;
        } catch (error) {
            console.error('Failed to load filters:', error);
            return [];
        }
    }
}