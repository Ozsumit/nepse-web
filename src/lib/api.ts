import type {
  AuthResponse,
  PortfolioResponse,
  AddStockRequest,
  HealthResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/api";

const rawUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://nepse-unified-api.pokhrelsumit36.workers.dev";

// Remove trailing slash to prevent double-slash 404 errors
const API_BASE_URL = rawUrl.replace(/\/+$/, "");

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
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
        this.setToken(null);
      }

      throw new Error(message);
    }

    if (
      data &&
      typeof data === "object" &&
      "ok" in data &&
      "data" in data &&
      data.ok
    ) {
      return data.data as T;
    }

    return data as T;
  }

  // =========================================================================
  // AUTH
  // =========================================================================
  async signup(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/v1/auth/me");
  }

  // =========================================================================
  // PORTFOLIO
  // =========================================================================
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

  // =========================================================================
  // SYSTEM & EMAIL
  // =========================================================================
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/health");
  }

  async sendEmail(data: {
    to: string;
    subject?: string;
    html?: string;
    text?: string;
    userAuthenticated?: boolean;
  }): Promise<{
    ok: boolean;
    provider: string;
    message: string;
    previewUrl?: string;
  }> {
    return this.request<{
      ok: boolean;
      provider: string;
      message: string;
      previewUrl?: string;
    }>("/api/v1/email/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // =========================================================================
  // REAL ADMIN DATABASE MANAGEMENT (Fetches from Cloudflare KV Backend)
  // =========================================================================
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/api/v1/admin/users");
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const res = await this.request<{ user: User }>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: "TemporaryPassword123!",
        isAdmin: data.isAdmin,
      }),
    });
    return res.user;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/api/v1/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/v1/admin/users/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
