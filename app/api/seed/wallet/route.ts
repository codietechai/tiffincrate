import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { WalletService } from "@/services/wallet-service";

export async function POST() {
  try {
    await connectMongoDB();

    const providers = await User.find({ role: "provider" }).select("_id email name");

    if (providers.length === 0) {
      return NextResponse.json({ error: "No providers found" }, { status: 404 });
    }

    const results = { created: 0, skipped: 0, failed: 0, details: [] as any[] };

    for (const provider of providers) {
      const result = await WalletService.createWallet(provider._id.toString(), "provider");

      if (result.success) {
        results.created++;
        results.details.push({ email: provider.email, status: "created" });
      } else if (result.error === "Wallet already exists") {
        results.skipped++;
        results.details.push({ email: provider.email, status: "skipped (already exists)" });
      } else {
        results.failed++;
        results.details.push({ email: provider.email, status: "failed", error: result.error });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Wallet seeding complete`,
      summary: {
        total: providers.length,
        created: results.created,
        skipped: results.skipped,
        failed: results.failed,
      },
      details: results.details,
    });
  } catch (error) {
    console.error("Seed wallet error:", error);
    return NextResponse.json(
      { error: "Failed to seed wallets", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
