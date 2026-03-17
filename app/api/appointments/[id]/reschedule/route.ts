import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const appointmentId = Number(id);

    const body = await request.json();
    const patientId = Number(body.patientId);
    const startTime = body.startTime;
    const endTime = body.endTime;

    if (!appointmentId || !patientId || !startTime || !endTime) {
      return Response.json(
        { error: "Missing required fields" },
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
        { error: "You are not authorized to reschedule this appointment" },
        { status: 403 },
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      return Response.json(
        { error: "Cancelled appointments cannot be rescheduled" },
        { status: 400 },
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (start >= end) {
      return Response.json(
        { error: "Start time must be before end time" },
        { status: 400 },
      );
    }

    if (start.toDateString() !== end.toDateString()) {
      return Response.json(
        { error: "Appointment must start and end on the same day" },
        { status: 400 },
      );
    }

    if (end <= new Date()) {
      return Response.json(
        { error: "New appointment time must be in the future" },
        { status: 400 },
      );
    }

    const dayOfWeek = start.getDay();
    const requestedStartTime = formatLocalTime(start);
    const requestedEndTime = formatLocalTime(end);

    const availabilities = await prisma.providerAvailability.findMany({
      where: {
        providerId: appointment.providerId,
        dayOfWeek,
      },
    });

    const isWithinAvailability = availabilities.some((availability) => {
      return (
        availability.startTime <= requestedStartTime &&
        availability.endTime >= requestedEndTime
      );
    });

    if (!isWithinAvailability) {
      return Response.json(
        { error: "Selected time is outside provider availability" },
        { status: 400 },
      );
    }

    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: appointment.id,
        },
        providerId: appointment.providerId,
        status: AppointmentStatus.SCHEDULED,
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
      },
    });

    if (overlappingAppointment) {
      return Response.json(
        { error: "Time slot is already booked" },
        { status: 400 },
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        startTime: start,
        endTime: end,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: true,
        provider: true,
      },
    });

    await prisma.event.create({
      data: {
        type: "PATIENT_APPOINTMENT_RESCHEDULED",
        payload: JSON.stringify({
          providerId: appointment.providerId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          oldStartTime: appointment.startTime.toISOString(),
          newStartTime: updatedAppointment.startTime.toISOString(),
        }),
      },
    });

    return Response.json(updatedAppointment);
  } catch (error) {
    console.error("Error rescheduling appointment:", error);

    return Response.json(
      { error: "Failed to reschedule appointment" },
      { status: 500 },
    );
  }
}
