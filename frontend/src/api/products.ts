import client from './client';
import type {Product, PaginatedProducts, KeyValue} from '../types/product';

export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface ProductPayload {
    title: string;
    category: {
        name: string;
        gender: 'men' | 'women' | 'kids';
    };
    images: string[];
    price: number;
    specifications: KeyValue[];
    description: string;
    brand: string;
    stock: number;
    tags: KeyValue[];
}

export const getProduct= async (filters: ProductFilters= {}) : Promise<PaginatedProducts> => {
    const res= await client.get<PaginatedProducts>(`/api/products`, {params: filters});
    return res.data;
};

export const getProductById= async (id : string): Promise<Product> => {
    const res= await client.get<Product>(`/api/products/${id}`);
    return res.data;
};

export const createProduct= async (data: ProductPayload): Promise<Product> => {
    const res= await client.post<Product>(`/api/products`, data);
    return res.data;
};

export const updateProduct= async (id: string, data: ProductPayload) : Promise<Product> => {
    const res= await client.put<Product>(`/api/products/${id}`, data);
    return res.data;
};

export const deleteProduct= async (id: string): Promise<void> => {
    await client.delete(`/api/products/${id}`);
};