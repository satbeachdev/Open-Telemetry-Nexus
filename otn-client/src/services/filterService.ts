import axios, { AxiosRequestConfig } from 'axios';
import { Filter } from '../models/Filter';

class FilterService {
    static async getFilters(): Promise<Filter[]> {
        try {
            const response = await axios.get('http://localhost:8000/filters'); 
            return response.data;
        } catch (error) {
            console.error('Failed to load filters:', error);
            return [];
        }
    }

    static async getFilterStringsOnly(): Promise<string[]> {
        try {
            const response = await axios.get('http://localhost:8000/filters?textOnly=true'); 
            return response.data;
        } catch (error) {
            console.error('Failed to load filters:', error);
            return [];
        }
    }
    static async DeleteFilter(filterId: number): Promise<void> {
        try {
            await axios.delete(`http://localhost:8000/filters/${filterId}`);
        } catch (error) {
            console.error('Failed to delete filter:', error);
            throw error;
        }
    }
}

export default FilterService;