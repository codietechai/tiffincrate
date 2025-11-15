import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        await connectMongoDB();

        console.log(userId)
        const canView =
            role === "consumer"
        if (!canView) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const providerIds = await Order.find({ consumerId: new mongoose.Types.ObjectId(userId as string) }).distinct("providerId");
        const providers = await ServiceProvider.find({
            _id: { $in: providerIds },
        })
            .populate("userId", "full_name email")
            .select("businessName userId");

        return NextResponse.json({ data: providers }, { status: 200 });


    } catch (error) {
        console.error("Get help requests error:", error);
        return NextResponse.json(
            { error: ERRORMESSAGE.HELPREQUEST_FETCH_FAILED },
            { status: 500 }
        );
    }
}

