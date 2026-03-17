import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const firstName = searchParams.get("firstName") || "";
    const lastName = searchParams.get("lastName") || "";
    const state = searchParams.get("state") || "";
    const specialty = searchParams.get("specialty") || "";

    const providers = await prisma.provider.findMany({
      where: {
        firstName: {
          contains: firstName,
        },
        lastName: {
          contains: lastName,
        },
        state: state && state !== "All States" ? state : undefined,
        specialty:
          specialty && specialty !== "All Specialties" ? specialty : undefined,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);

    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
