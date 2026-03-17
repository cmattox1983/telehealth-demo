import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || user.password !== password || user.role !== role) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    let patientId: number | null = null;
    let providerId: number | null = null;

    if (user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!patient) {
        return Response.json(
          { error: "Patient profile not found" },
          { status: 404 },
        );
      }

      patientId = patient.id;
    }

    if (user.role === "PROVIDER") {
      const provider = await prisma.provider.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!provider) {
        return Response.json(
          { error: "Provider profile not found" },
          { status: 404 },
        );
      }

      providerId = provider.id;
    }

    return Response.json({
      id: user.id,
      email: user.email,
      role: user.role,
      patientId,
      providerId,
    });
  } catch (error) {
    console.error("POST /api/login error:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
