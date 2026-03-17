import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type EventPayload = {
  providerId: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  oldStartTime?: string;
  newStartTime?: string;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const providerId = Number(id);

    if (!providerId) {
      return Response.json({ error: "Invalid provider id" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return Response.json({ error: "Provider not found" }, { status: 404 });
    }

    const now = new Date();

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
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
        patient: true,
      },
    });

    const rawEvents = await prisma.event.findMany({
      where: {
        type: {
          in: [
            "PATIENT_APPOINTMENT_SCHEDULED",
            "PATIENT_APPOINTMENT_CANCELLED",
            "PATIENT_APPOINTMENT_RESCHEDULED",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const alerts = rawEvents
      .map((event) => {
        try {
          const payload = JSON.parse(event.payload) as EventPayload;

          if (payload.providerId !== providerId) {
            return null;
          }

          return {
            id: event.id,
            type: event.type,
            patientName: payload.patientName,
            oldStartTime: payload.oldStartTime ?? null,
            newStartTime: payload.newStartTime ?? null,
            createdAt: event.createdAt,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, 10);

    return Response.json({
      provider,
      upcomingAppointments,
      alerts,
    });
  } catch (error) {
    console.error("Error loading provider sidebar data:", error);

    return Response.json(
      { error: "Failed to load provider sidebar data" },
      { status: 500 },
    );
  }
}
