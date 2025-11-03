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

        console.log(id)
        await connectMongoDB();

        const data = await deliveryOrders.aggregate([
            { $match: { orderId: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "orderId"
                }
            },
            { $unwind: "$orderId" },
            {
                $group: {
                    _id: "$orderId._id",
                    orderId: { $first: "$orderId" },
                    deliveries: {
                        $push: {
                            _id: "$_id",
                            deliveryDate: "$deliveryDate",
                            deliveryStatus: "$deliveryStatus",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt"
                        }
                    }
                }
            },
            { $project: { _id: 0, orderId: 1, deliveries: 1 } }
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
