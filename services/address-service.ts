export class AddressService {
  private static baseUrl = "/api/address";

  static async fetchAll(): Promise<{
    success: boolean;
    data: any[];
  }> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch addresses");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async fetchDefault(): Promise<{
    success: boolean;
    data: any | null;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/default`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch default address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async fetchById(id: string): Promise<{
    success: boolean;
    data: any;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async create(payload: any): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async update(
    id: string,
    payload: any
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async delete(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  static async setDefault(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/set-default/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to set default address");
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  }
}
