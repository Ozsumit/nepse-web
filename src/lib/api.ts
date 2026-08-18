import type {
  AuthResponse,
  PortfolioResponse,
  AddStockRequest,
  HealthResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://nepse-unified-api.pokhrelsumit36.workers.dev";

const INITIAL_USERS: User[] = [
  {
    id: "admin-user-001",
    email: "admin@nepse.com",
    telegramLinked: true,
    pushDeviceCount: 1,
    createdAt: Date.now() - 86400000 * 30,
    isAdmin: true,
    status: "active",
  },
  {
    id: "demo-user-002",
    email: "investor@nepse.com",
    telegramLinked: false,
    pushDeviceCount: 0,
    createdAt: Date.now() - 86400000 * 15,
    isAdmin: false,
    status: "active",
  },
];

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getStoredUsers(): User[] {
    if (typeof window === "undefined") return INITIAL_USERS;
    const stored = localStorage.getItem("nepse_admin_users");
    if (!stored) {
      localStorage.setItem("nepse_admin_users", JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_USERS;
    }
  }

  private saveStoredUsers(users: User[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("nepse_admin_users", JSON.stringify(users));
  }

  private enrichUser(user: User): User {
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());

    const isAdmin = existing
      ? existing.isAdmin ?? false
      : user.email.toLowerCase().includes("admin");

    const status = existing?.status || "active";

    const enrichedUser: User = {
      ...user,
      isAdmin,
      status,
    };

    if (!existing) {
      this.saveStoredUsers([...users, enrichedUser]);
    }

    return enrichedUser;
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

    if (data && typeof data === "object" && "ok" in data && "data" in data && data.ok) {
      return data.data as T;
    }

    return data as T;
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    res.user = this.enrichUser(res.user);
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    res.user = this.enrichUser(res.user);
    return res;
  }

  async getMe(): Promise<User> {
    const user = await this.request<User>("/api/v1/auth/me");
    return this.enrichUser(user);
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

  async sendEmail(data: {
    to: string;
    subject?: string;
    html?: string;
    text?: string;
  }): Promise<{ ok: boolean; provider: string; message: string; previewUrl?: string }> {
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) {
      throw new Error(result.error || "Failed to send email");
    }
    return result;
  }

  // Admin User Management
  async getUsers(): Promise<User[]> {
    return this.getStoredUsers();
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const users = this.getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: data.email,
      telegramLinked: false,
      pushDeviceCount: 0,
      createdAt: Date.now(),
      isAdmin: data.isAdmin ?? false,
      status: "active",
    };

    const updated = [newUser, ...users];
    this.saveStoredUsers(updated);
    return newUser;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const users = this.getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...users[index],
      ...data,
    };

    users[index] = updatedUser;
    this.saveStoredUsers(users);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const users = this.getStoredUsers();
    const filtered = users.filter((u) => u.id !== id);
    this.saveStoredUsers(filtered);
  }
}

export const api = new ApiClient();
