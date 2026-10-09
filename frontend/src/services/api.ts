import axios from 'axios';
import type { Order, RefundClaim, AnalysisResult, AnalyticsSummary, ParadoxScenario, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getProducts = async (category?: string): Promise<Product[]> => {
  const res = await api.get('/products', { params: { category } });
  return res.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders');
  return res.data;
};

export const createOrder = async (orderData: Partial<Order> & Record<string, any>): Promise<Order> => {
  const res = await api.post('/orders', orderData);
  return res.data;
};

export const getRefundClaims = async (): Promise<RefundClaim[]> => {
  const res = await api.get('/refunds');
  return res.data;
};

export const getRefundClaim = async (id: string): Promise<RefundClaim> => {
  const res = await api.get(`/refunds/${id}`);
  return res.data;
};

export const createRefundClaim = async (claimData: {
  order_id: string;
  product_id: string;
  reason: string;
  description: string;
}): Promise<RefundClaim> => {
  const res = await api.post('/refunds', claimData);
  return res.data;
};

export const analyzeEvidence = async (formData: FormData): Promise<AnalysisResult> => {
  const res = await api.post('/evidence/analyze', formData);
  return res.data;
};

export const submitReviewDecision = async (reviewData: {
  claim_id: string;
  decision: string;
  reviewer_notes: string;
}): Promise<any> => {
  const res = await api.post('/reviews', reviewData);
  return res.data;
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await api.get('/analytics');
  return res.data;
};

export const getParadoxDemo = async (): Promise<ParadoxScenario> => {
  const res = await api.get('/demo/paradox');
  return res.data;
};
