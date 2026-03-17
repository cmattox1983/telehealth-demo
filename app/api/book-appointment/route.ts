import { prisma } from "@/lib/prisma";

function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, patientId, startTime, endTime } = body;

    const parsedProviderId = Number(providerId);
    const parsedPatientId = Number(patientId);

    if (!parsedProviderId || !parsedPatientId || !startTime || !endTime) {
      return Response.json(
        { error: "Missing required fields" },
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

    const provider = await prisma.provider.findUnique({
      where: { id: parsedProviderId },
    });

    if (!provider) {
      return Response.json({ error: "Provider not found" }, { status: 404 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: parsedPatientId },
    });

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const jsDay = start.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    const requestedStartTime = formatLocalTime(start);
    const requestedEndTime = formatLocalTime(end);

    const availabilities = await prisma.providerAvailability.findMany({
      where: {
        providerId: parsedProviderId,
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

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: parsedProviderId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (existingAppointment) {
      return Response.json(
        { error: "Time slot is already booked" },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        providerId: parsedProviderId,
        patientId: parsedPatientId,
        startTime: start,
        endTime: end,
      },
      include: {
        patient: true,
        provider: true,
      },
    });

    await prisma.event.create({
      data: {
        type: "PATIENT_APPOINTMENT_SCHEDULED",
        payload: JSON.stringify({
          providerId: appointment.providerId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          newStartTime: appointment.startTime.toISOString(),
        }),
      },
    });

    return Response.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error booking appointment:", error);

    return Response.json(
      { error: "Failed to book appointment" },
      { status: 500 },
    );
  }
}
