import axios, { type AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import type { AggregatedProduct, ProductSearchResponse } from '@yourvivac/types';

/**
 * Cliente proxy hacia el microservicio agregador (Cordal, repo aparte `vivac-aggregator`).
 * La API de YourVivac NUNCA scrapea: delega aquí. Cordal NO se construye en este repo.
 */
let client: AxiosInstance | null = null;
function http(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: env.STORE_SERVICE_URL,
      timeout: 12_000,
      headers: env.STORE_SERVICE_API_KEY ? { 'x-api-key': env.STORE_SERVICE_API_KEY } : undefined,
    });
  }
  return client;
}

export async function searchProducts(
  q: string,
  stores?: string[],
  limit = 20,
): Promise<ProductSearchResponse> {
  const { data } = await http().get<ProductSearchResponse>('/search', {
    params: { q, stores: stores?.join(','), limit },
  });
  return data;
}

export async function getProduct(store: string, externalId: string): Promise<AggregatedProduct> {
  const { data } = await http().get<AggregatedProduct>(`/product/${store}/${externalId}`);
  return data;
}
