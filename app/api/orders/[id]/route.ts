import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import deliveryOrders from "@/models/deliveryOrders";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    let query: any = {};
    if (role === "consumer") query.consumerId = userId;
    else if (role === "provider") query.providerId = userId;

    const { id } = params;
    await connectMongoDB();

const data = await deliveryOrders.aggregate([
  {
    $match: {
      orderId: new mongoose.Types.ObjectId(id),
    },
  },

  // 🧩 Join Order Details
  {
    $lookup: {
      from: "orders",
      localField: "orderId",
      foreignField: "_id",
      as: "order",
    },
  },
  { $unwind: "$order" },

  // 🧩 Join Menu Details
  {
    $lookup: {
      from: "menus", // ✅ FIXED: collection name must be plural & lowercase
      localField: "order.menuId", // link from order → menu
      foreignField: "_id",
      as: "menu",
    },
  },
  { $unwind: { path: "$menu", preserveNullAndEmptyArrays: true } },

  // 🧩 Join Provider Details
  {
    $lookup: {
      from: "serviceproviders",
      localField: "menu.providerId",
      foreignField: "_id",
      as: "provider",
    },
  },
  { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },

  // 🧩 Join Review (check if user reviewed)
  {
    $lookup: {
      from: "reviews",
      let: {
        oid: "$orderId",
        uid: new mongoose.Types.ObjectId(userId as string),
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$orderId", "$$oid"] },
                { $eq: ["$consumerId", "$$uid"] },
              ],
            },
          },
        },
      ],
      as: "userReview",
    },
  },

  // 🧠 Group all deliveries by order
  {
    $group: {
      _id: "$order._id",
      order: { $first: "$order" },
      menu: { $first: "$menu" },
      provider: { $first: "$provider" },

      isReviewed: {
        $first: { $gt: [{ $size: "$userReview" }, 0] },
      },

      deliveries: {
        $push: {
          _id: "$_id",
          deliveryDate: "$deliveryDate",
          deliveryStatus: "$deliveryStatus",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
    },
  },

  // 🧾 Final projection
  {
    $project: {
      _id: 0,
      order: 1,
      menu: 1,
      'provider.businessName': 1,
      'provider.rating': 1,
      'provider.description': 1,
      'provider.location': 1,
      deliveries: 1,
      isReviewed: 1,
    },
  },
]);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
