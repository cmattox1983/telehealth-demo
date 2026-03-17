import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        provider: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const events = appointments.map((appointment) => ({
      id: appointment.id.toString(),
      title: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      start: appointment.startTime.toISOString(),
      end: appointment.endTime.toISOString(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching provider appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}
