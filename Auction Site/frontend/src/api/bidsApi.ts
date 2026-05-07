import apiClient from "./apiClient";
import type { Bid, CreateBidRequest } from "../types";

export const bidsApi = {
  getByAuction: async (auctionId: number): Promise<Bid[]> => {
    const res = await apiClient.get<Bid[]>(`/bids/auction/${auctionId}`);
    return res.data;
  },

  create: async (auctionId: number, data: CreateBidRequest): Promise<Bid> => {
    const res = await apiClient.post<Bid>(`/bids/auction/${auctionId}`, data);
    return res.data;
  },

  delete: async (bidId: number, auctionId: number): Promise<void> => {
    await apiClient.delete(`/bids/${bidId}/auction/${auctionId}`);
  },
};
