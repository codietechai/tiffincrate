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
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },

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

      { $unwind: "$order" },

      {
        $group: {
          _id: "$order._id",
          order: { $first: "$order" },

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

      {
        $project: {
          _id: 0,
          order: 1,
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
