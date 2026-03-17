import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const providerId = Number(id);

    if (isNaN(providerId)) {
      return NextResponse.json(
        { error: "Invalid provider id" },
        { status: 400 },
      );
    }

    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId,
      },
      include: {
        providerAvailabilities: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        appointments: {
          where: {
            status: "SCHEDULED",
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      provider: {
        id: provider.id,
        firstName: provider.firstName,
        lastName: provider.lastName,
        specialty: provider.specialty,
        state: provider.state,
      },
      availabilities: provider.providerAvailabilities,
      appointments: provider.appointments,
    });
  } catch (error) {
    console.error("Error fetching provider availability:", error);

    return NextResponse.json(
      { error: "Failed to fetch provider availability" },
      { status: 500 },
    );
  }
}
