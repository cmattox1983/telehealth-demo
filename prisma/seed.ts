import { PrismaClient, UserRole, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const patientUser1 = await prisma.user.create({
    data: {
      email: "patient1@test.com",
      password: "password123",
      role: UserRole.PATIENT,
    },
  });

  const patientUser2 = await prisma.user.create({
    data: {
      email: "patient2@test.com",
      password: "password123",
      role: UserRole.PATIENT,
    },
  });

  const patientUser3 = await prisma.user.create({
    data: {
      email: "patient3@test.com",
      password: "password123",
      role: UserRole.PATIENT,
    },
  });

  const providerUser1 = await prisma.user.create({
    data: {
      email: "provider1@test.com",
      password: "password123",
      role: UserRole.PROVIDER,
    },
  });

  const providerUser2 = await prisma.user.create({
    data: {
      email: "provider2@test.com",
      password: "password123",
      role: UserRole.PROVIDER,
    },
  });

  const providerUser3 = await prisma.user.create({
    data: {
      email: "provider3@test.com",
      password: "password123",
      role: UserRole.PROVIDER,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    },
  });

  const patient1 = await prisma.patient.create({
    data: {
      userId: patientUser1.id,
      firstName: "Chris",
      lastName: "Mattox",
      email: "patient1@test.com",
      state: "FL",
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: patientUser2.id,
      firstName: "Ashley",
      lastName: "Parker",
      email: "patient2@test.com",
      state: "GA",
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      userId: patientUser3.id,
      firstName: "Daniel",
      lastName: "Reyes",
      email: "patient3@test.com",
      state: "TX",
    },
  });

  const provider1 = await prisma.provider.create({
    data: {
      userId: providerUser1.id,
      firstName: "Sarah",
      lastName: "Mitchell",
      specialty: "Orthopedics",
      state: "FL",
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      userId: providerUser2.id,
      firstName: "John",
      lastName: "Smith",
      specialty: "Neurology",
      state: "TX",
    },
  });

  const provider3 = await prisma.provider.create({
    data: {
      userId: providerUser3.id,
      firstName: "Mark",
      lastName: "Garcia",
      specialty: "Cardiology",
      state: "CA",
    },
  });

  await prisma.providerAvailability.createMany({
    data: [
      {
        providerId: provider1.id,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "12:00",
      },
      {
        providerId: provider1.id,
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "12:00",
      },
      {
        providerId: provider1.id,
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "12:00",
      },
      {
        providerId: provider1.id,
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "12:00",
      },
      {
        providerId: provider1.id,
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "12:00",
      },

      {
        providerId: provider2.id,
        dayOfWeek: 1,
        startTime: "13:00",
        endTime: "17:00",
      },
      {
        providerId: provider2.id,
        dayOfWeek: 2,
        startTime: "13:00",
        endTime: "17:00",
      },
      {
        providerId: provider2.id,
        dayOfWeek: 3,
        startTime: "13:00",
        endTime: "17:00",
      },
      {
        providerId: provider2.id,
        dayOfWeek: 4,
        startTime: "13:00",
        endTime: "17:00",
      },
      {
        providerId: provider2.id,
        dayOfWeek: 5,
        startTime: "13:00",
        endTime: "17:00",
      },

      {
        providerId: provider3.id,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "11:00",
      },
      {
        providerId: provider3.id,
        dayOfWeek: 2,
        startTime: "08:00",
        endTime: "11:00",
      },
      {
        providerId: provider3.id,
        dayOfWeek: 3,
        startTime: "08:00",
        endTime: "11:00",
      },
      {
        providerId: provider3.id,
        dayOfWeek: 4,
        startTime: "08:00",
        endTime: "11:00",
      },
      {
        providerId: provider3.id,
        dayOfWeek: 5,
        startTime: "08:00",
        endTime: "11:00",
      },
    ],
  });

  await prisma.appointment.createMany({
    data: [
      {
        providerId: provider1.id,
        patientId: patient1.id,
        startTime: new Date("2026-03-17T10:00:00"),
        endTime: new Date("2026-03-17T10:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Knee Pain Consultation",
        notes: "Initial orthopedic visit",
      },
      {
        providerId: provider1.id,
        patientId: patient2.id,
        startTime: new Date("2026-03-17T11:00:00"),
        endTime: new Date("2026-03-17T11:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Shoulder Follow-up",
        notes: "Review mobility progress",
      },
      {
        providerId: provider2.id,
        patientId: patient1.id,
        startTime: new Date("2026-03-18T14:00:00"),
        endTime: new Date("2026-03-18T14:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Migraine Follow-up",
        notes: "Review headache symptoms",
      },
      {
        providerId: provider2.id,
        patientId: patient3.id,
        startTime: new Date("2026-03-18T15:00:00"),
        endTime: new Date("2026-03-18T15:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Neurology Consultation",
        notes: "First-time neuro visit",
      },
      {
        providerId: provider3.id,
        patientId: patient2.id,
        startTime: new Date("2026-03-19T09:00:00"),
        endTime: new Date("2026-03-19T09:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Heart Checkup",
        notes: "Routine cardiology appointment",
      },
      {
        providerId: provider3.id,
        patientId: patient3.id,
        startTime: new Date("2026-03-19T10:00:00"),
        endTime: new Date("2026-03-19T10:30:00"),
        status: AppointmentStatus.SCHEDULED,
        reason: "Blood Pressure Review",
        notes: "Check medication response",
      },
    ],
  });

  console.log(
    "Demo users, patients, providers, availabilities, and appointments created",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
