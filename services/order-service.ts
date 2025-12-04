import { IOrder } from "@/models/Order";

export class OrderService {
  private static baseUrl = "/api/orders";

  static async placeOrder(
    data: any
  ): Promise<{ data: IOrder; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place order");
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.log("Error placing order:", error);
      throw error;
    }
  }
}
