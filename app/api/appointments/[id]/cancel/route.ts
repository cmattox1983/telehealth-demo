import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const appointmentId = Number(id);

    const body = await request.json();
    const patientId = Number(body.patientId);

    if (!appointmentId || !patientId) {
      return Response.json(
        { error: "Invalid appointment or patient id" },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        provider: true,
      },
    });

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.patientId !== patientId) {
      return Response.json(
        { error: "You are not authorized to cancel this appointment" },
        { status: 403 },
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      return Response.json(
        { error: "Appointment is already cancelled" },
        { status: 400 },
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
      include: {
        patient: true,
        provider: true,
      },
    });

    await prisma.event.create({
      data: {
        type: "PATIENT_APPOINTMENT_CANCELLED",
        payload: JSON.stringify({
          providerId: appointment.providerId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          oldStartTime: appointment.startTime.toISOString(),
        }),
      },
    });

    return Response.json(updatedAppointment);
  } catch (error) {
    console.error("Error cancelling appointment:", error);

    return Response.json(
      { error: "Failed to cancel appointment" },
      { status: 500 },
    );
  }
}
