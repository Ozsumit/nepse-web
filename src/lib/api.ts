import type {
  AuthResponse,
  PortfolioResponse,
  AddStockRequest,
  PortfolioItem,
  NotificationSettings,
  HealthResponse,
  User,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://nepse-unified-api.pokhrelsumit36.workers.dev";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || "An error occurred";

      if (response.status === 401) {
        this.token = null;

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
      }

      throw new Error(message);
    }

    return data as T;
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/v1/auth/me");
  }

  async getPortfolio(): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>("/api/v1/portfolio");
  }

  async addStock(
    data: AddStockRequest,
  ): Promise<{ symbol: string; message: string }> {
    return this.request("/api/v1/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeStock(
    symbol: string,
  ): Promise<{ symbol: string; message: string }> {
    return this.request(`/api/v1/portfolio/${symbol}`, {
      method: "DELETE",
    });
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/health");
  }
}

export const api = new ApiClient();
