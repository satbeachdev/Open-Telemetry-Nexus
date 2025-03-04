import axios, { AxiosRequestConfig } from 'axios';
import { Filter } from '../models/Filter';
import ConfigService from './configService';

class FilterService {
    private static configService = ConfigService.getInstance();

    static async getFilters(): Promise<Filter[]> {
        try {
            const config = await this.configService.getConfig();
            const response = await axios.get(`${config.apiBaseUrl}/filters`); 
            return response.data;
        } catch (error) {
            console.error('Failed to load filters:', error);
            return [];
        }
    }

    static async getFilterStringsOnly(): Promise<string[]> {
        try {
            const config = await this.configService.getConfig();
            const response = await axios.get(`${config.apiBaseUrl}/filters?textOnly=true`); 
            return response.data;
        } catch (error) {
            console.error('Failed to load filters:', error);
            return [];
        }
    }
    static async DeleteFilter(filterId: number): Promise<void> {
        try {
            const config = await this.configService.getConfig();
            await axios.delete(`${config.apiBaseUrl}/filters/${filterId}`);
        } catch (error) {
            console.error('Failed to delete filter:', error);
            throw error;
        }
    }
}

export default FilterService;