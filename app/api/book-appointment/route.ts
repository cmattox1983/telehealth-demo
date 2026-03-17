import { prisma } from "@/lib/prisma";

function buildUtcDate(
  dateString: string,
  timeString: string,
  timezoneOffset: number,
) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);

  const utcMs =
    Date.UTC(year, month - 1, day, hours, minutes, 0) +
    timezoneOffset * 60 * 1000;

  return new Date(utcMs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, patientId, date, startTime, endTime, timezoneOffset } =
      body;

    const parsedProviderId = Number(providerId);
    const parsedPatientId = Number(patientId);
    const parsedTimezoneOffset = Number(timezoneOffset);

    if (
      !parsedProviderId ||
      !parsedPatientId ||
      !date ||
      !startTime ||
      !endTime ||
      Number.isNaN(parsedTimezoneOffset)
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const start = buildUtcDate(date, startTime, parsedTimezoneOffset);
    const end = buildUtcDate(date, endTime, parsedTimezoneOffset);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (start >= end) {
      return Response.json(
        { error: "Start time must be before end time" },
        { status: 400 },
      );
    }

    const selectedDate = new Date(`${date}T00:00:00`);
    const jsDay = selectedDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

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

    const availabilities = await prisma.providerAvailability.findMany({
      where: {
        providerId: parsedProviderId,
        dayOfWeek,
      },
    });

    const isWithinAvailability = availabilities.some((availability) => {
      return (
        availability.startTime <= startTime && availability.endTime >= endTime
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
