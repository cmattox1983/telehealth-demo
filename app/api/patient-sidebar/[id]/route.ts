import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const patientId = Number(id);

    if (!patientId) {
      return Response.json({ error: "Invalid patient id" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const now = new Date();

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId,
        status: AppointmentStatus.SCHEDULED,
        endTime: {
          gt: now,
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
      include: {
        provider: true,
      },
    });

    return Response.json({
      patient,
      upcomingAppointments,
    });
  } catch (error) {
    console.error("Error loading patient sidebar data:", error);

    return Response.json(
      { error: "Failed to load patient sidebar data" },
      { status: 500 },
    );
  }
}
