import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=pk.1c92a48b193de801960d88e5f066fe8b&lat=${lat}&lon=${lon}&format=json`
    );

    if (!res.ok) {
      throw new Error(`Upstream error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Reverse geocode error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
