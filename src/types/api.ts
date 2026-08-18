export interface User {
  id: string;
  email: string;
  telegramLinked: boolean;
  pushDeviceCount: number;
  createdAt: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PortfolioItem {
  symbol: string;
  ltp: number;
  targetBuy: number;
  targetSell: number;
  isBuyHit: boolean;
  isSellHit: boolean;
}

export interface PortfolioResponse {
  totalValue: number;
  count: number;
  marketStale: boolean;
  items: PortfolioItem[];
}

export interface AddStockRequest {
  symbol: string;
  targetBuy: number;
  targetSell: number;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  email: string;
  phone: string;
  buyAlerts: boolean;
  sellAlerts: boolean;
  athAlerts: boolean;
}

export interface HealthResponse {
  status: string;
  market: {
    sourceUsed: string;
    stale: boolean;
    symbolsLoaded: number;
  };
  sources: Record<string, string>;
  monitoredStocksCount: number;
}

export interface MarketPrice {
  symbol: string;
  price: number;
}