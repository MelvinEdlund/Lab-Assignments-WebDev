import apiClient from "./apiClient";
import type {
  Auction,
  CreateAuctionRequest,
  UpdateAuctionRequest,
} from "../types";

export const auctionsApi = {
  getOpen: async (search?: string): Promise<Auction[]> => {
    const res = await apiClient.get<Auction[]>("/auctions", {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  getClosed: async (search?: string): Promise<Auction[]> => {
    const res = await apiClient.get<Auction[]>("/auctions/closed", {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  getById: async (id: number): Promise<Auction> => {
    const res = await apiClient.get<Auction>(`/auctions/${id}`);
    return res.data;
  },

  create: async (data: CreateAuctionRequest): Promise<Auction> => {
    const res = await apiClient.post<Auction>("/auctions", data);
    return res.data;
  },

  update: async (id: number, data: UpdateAuctionRequest): Promise<Auction> => {
    const res = await apiClient.put<Auction>(`/auctions/${id}`, data);
    return res.data;
  },
};
