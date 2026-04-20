import client from './client';
import type {Category} from '../types/category';

export const getCategories= async (): Promise<Category[]> => {
    const res= await client.get<Category[]>('/categories');
    return res.data;
};