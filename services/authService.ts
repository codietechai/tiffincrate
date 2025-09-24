import { IUser } from "@/models/User";

export class AuthService {
  private static baseUrl = "/api/auth";

  static async signin(data: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.log("Error creating customer:", error);
      throw error;
    }
  }

  static async signup(
    data: unknown
  ): Promise<{ user: IUser; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      return response.json();
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }
}
