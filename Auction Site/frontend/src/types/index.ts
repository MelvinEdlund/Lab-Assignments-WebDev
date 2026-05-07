export interface AuthResponse {
  token: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthUser {
  username: string;
  isAdmin: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  highestBid: number | null;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isActive: boolean;
  userId: number;
  username: string;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  startDate: string;
  endDate: string;
}

export interface UpdateAuctionRequest {
  title: string;
  description: string;
  endDate: string;
}

export interface Bid {
  id: number;
  amount: number;
  createdAt: string;
  userId: number;
  username: string;
  auctionId: number;
}

export interface CreateBidRequest {
  amount: number;
}

export interface ApiErrorResponse {
  message: string;
}
