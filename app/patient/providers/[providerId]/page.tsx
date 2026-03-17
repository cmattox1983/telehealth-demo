"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import PatientTopNav from "@/components/PatientTopNav";
import PatientSideNav from "@/components/PatientSideNav";

type ProviderInfo = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  state: string;
};

type Availability = {
  id: number;
  providerId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Appointment = {
  id: number;
  providerId: number;
  patientId: number;
  startTime: string;
  endTime: string;
  status: string;
};

type ProviderAvailabilityResponse = {
  provider: ProviderInfo;
  availabilities: Availability[];
  appointments: Appointment[];
};

type TimeSlot = {
  label: string;
  start: Date;
  end: Date;
  blocked: boolean;
};

export default function ProviderAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = Number(params.providerId);

  const [loading, setLoading] = useState(false);
  const [providerAvailability, setProviderAvailability] =
    useState<ProviderAvailabilityResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedMessage, setConfirmedMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  async function fetchProviderAvailability(id: number) {
    try {
      setLoading(true);

      const response = await fetch(`/api/providers/${id}/availability`);

      if (!response.ok) {
        throw new Error("Failed to fetch provider availability");
      }

      const data = await response.json();
      setProviderAvailability(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "PATIENT") {
      router.push("/login");
      return;
    }

    if (!isNaN(providerId)) {
      fetchProviderAvailability(providerId);
    }
  }, [providerId, router]);

  const slots = useMemo(() => {
    if (!providerAvailability) return [];

    const selected = new Date(`${selectedDate}T00:00:00`);
    const jsDay = selected.getDay();
    const normalizedDay = jsDay === 0 ? 7 : jsDay;

    const dayAvailabilities = providerAvailability.availabilities.filter(
      (availability) => availability.dayOfWeek === normalizedDay,
    );

    if (dayAvailabilities.length === 0) return [];

    const dayAppointments = providerAvailability.appointments.filter(
      (appointment) => {
        const appointmentDate = new Date(appointment.startTime);

        return (
          appointmentDate.getFullYear() === selected.getFullYear() &&
          appointmentDate.getMonth() === selected.getMonth() &&
          appointmentDate.getDate() === selected.getDate()
        );
      },
    );

    const generatedSlots: TimeSlot[] = [];

    dayAvailabilities.forEach((availability) => {
      const [startHour, startMinute] = availability.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = availability.endTime.split(":").map(Number);

      let current = new Date(`${selectedDate}T00:00:00`);
      current.setHours(startHour, startMinute, 0, 0);

      const endBoundary = new Date(`${selectedDate}T00:00:00`);
      endBoundary.setHours(endHour, endMinute, 0, 0);

      while (current < endBoundary) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        if (slotEnd <= endBoundary) {
          const now = new Date();
          const isPast = slotEnd <= now;

          const isBooked = dayAppointments.some((appointment) => {
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);

            return slotStart < appointmentEnd && slotEnd > appointmentStart;
          });

          const blocked = isPast || isBooked;

          generatedSlots.push({
            label: formatTime(slotStart),
            start: slotStart,
            end: slotEnd,
            blocked,
          });
        }

        current.setMinutes(current.getMinutes() + 30);
      }
    });

    return generatedSlots;
  }, [providerAvailability, selectedDate]);

  function handleSlotClick(slot: TimeSlot) {
    if (slot.blocked) return;
    setSelectedSlot(slot);
    setShowSuccessModal(false);
    setShowConfirmModal(true);
  }

  async function handleConfirmYes() {
    if (!selectedSlot || !providerAvailability) return;

    try {
      setLoading(true);

      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        throw new Error("No logged-in user found");
      }

      const loggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "PATIENT") {
        throw new Error("Only patients can book appointments");
      }

      if (!loggedInUser.patientId) {
        throw new Error("Patient profile not found");
      }

      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: providerAvailability.provider.id,
          patientId: loggedInUser.patientId,
          startTime: formatDateTimeLocal(selectedSlot.start),
          endTime: formatDateTimeLocal(selectedSlot.end),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setConfirmedMessage(
        `Appointment selected with Dr. ${
          providerAvailability.provider.lastName
        } on ${formatDisplayDate(selectedDate)} at ${selectedSlot.label}.`,
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);

      await fetchProviderAvailability(providerAvailability.provider.id);
    } catch (error) {
      console.error("Error booking appointment:", error);

      setConfirmedMessage(
        error instanceof Error
          ? error.message
          : "Failed to book appointment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmNo() {
    setShowConfirmModal(false);
    setSelectedSlot(null);
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
  }

  const confirmModal =
    mounted && showConfirmModal && selectedSlot && providerAvailability
      ? createPortal(
          <>
            <div
              onClick={handleConfirmNo}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 99998,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(92vw, 520px)",
                zIndex: 99999,
              }}
            >
              <div className="overflow-hidden rounded-2xl border-4 border-blue-500 bg-teal-100 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <div className="bg-blue-300 px-6 py-5">
                  <h3 className="text-center text-2xl font-bold text-white">
                    Confirm Appointment
                  </h3>
                </div>

                <div className="px-6 py-6">
                  <div className="rounded-2xl border-2 border-blue-200 bg-white/80 p-5 text-center shadow-sm">
                    <p className="text-lg font-semibold text-slate-800">
                      Schedule with Dr.{" "}
                      {providerAvailability.provider.firstName}{" "}
                      {providerAvailability.provider.lastName}?
                    </p>

                    <p className="mt-3 text-base font-medium text-slate-600">
                      {formatDisplayDate(selectedDate)} at {selectedSlot.label}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleConfirmYes}
                        className="h-12 rounded-xl bg-teal-500 px-6 text-base font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-teal-600 cursor-pointer"
                      >
                        Yes
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmNo}
                        className="h-12 rounded-xl border-2 border-slate-300 bg-white px-6 text-base font-bold text-slate-700 transition duration-300 hover:scale-[1.02] hover:border-blue-500 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  const successModal =
    mounted && showSuccessModal
      ? createPortal(
          <>
            <div
              onClick={handleCloseSuccessModal}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 99998,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(92vw, 520px)",
                zIndex: 99999,
              }}
            >
              <div className="overflow-hidden rounded-2xl border-4 border-blue-500 bg-teal-100 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <div className="bg-blue-300 px-6 py-5">
                  <h3 className="text-center text-2xl font-bold text-white">
                    Appointment Selected
                  </h3>
                </div>

                <div className="px-6 py-6">
                  <div className="rounded-2xl border-2 border-blue-200 bg-white/80 p-5 text-center shadow-sm">
                    <p className="text-lg font-semibold text-slate-800">
                      {confirmedMessage}
                    </p>

                    <button
                      type="button"
                      onClick={handleCloseSuccessModal}
                      className="mt-6 h-12 w-full rounded-xl bg-teal-500 px-6 text-base font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-teal-600 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <main className="min-h-screen bg-slate-100">
        <PatientTopNav />

        <div className="flex min-h-[calc(100vh-6rem)] flex-col lg:flex-row">
          <div className="hidden lg:block lg:w-[320px] lg:flex-shrink-0">
            <PatientSideNav />
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
            <section className="w-full max-w-6xl">
              <div className="overflow-hidden rounded-2xl border-4 border-blue-500 bg-teal-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                <div className="bg-blue-300 px-6 py-6 sm:px-8 sm:py-7">
                  <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    Provider Availability
                  </h1>

                  <p className="mt-3 text-center text-sm font-medium text-white/90 sm:text-base md:text-lg">
                    Choose an available time to request your appointment.
                  </p>
                </div>

                <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10">
                  {loading && (
                    <div className="rounded-xl border border-blue-200 bg-white px-4 py-5 text-center text-base font-medium text-slate-700 shadow-sm">
                      Loading provider availability...
                    </div>
                  )}

                  {!loading && providerAvailability && (
                    <div className="space-y-8">
                      <div className="rounded-2xl border-2 border-blue-200 bg-white/70 p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex justify-start">
                          <button
                            type="button"
                            onClick={() => router.push("/patient/search")}
                            className="rounded-xl border-2 border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-600 transition duration-200 hover:bg-blue-50 cursor-pointer"
                          >
                            Back to Provider Search
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-xl border border-blue-100 bg-white px-4 py-4">
                            <p className="text-sm font-semibold text-slate-500">
                              Provider
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-800">
                              Dr. {providerAvailability.provider.firstName}{" "}
                              {providerAvailability.provider.lastName}
                            </p>
                          </div>

                          <div className="rounded-xl border border-blue-100 bg-white px-4 py-4">
                            <p className="text-sm font-semibold text-slate-500">
                              Specialty
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-800">
                              {providerAvailability.provider.specialty}
                            </p>
                          </div>

                          <div className="rounded-xl border border-blue-100 bg-white px-4 py-4">
                            <p className="text-sm font-semibold text-slate-500">
                              State
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-800">
                              {providerAvailability.provider.state}
                            </p>
                          </div>

                          <div className="rounded-xl border border-blue-100 bg-white px-4 py-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Select date
                            </label>

                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedSlot(null);
                              }}
                              className="h-12 w-full rounded-xl border-2 border-teal-700 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border-2 border-blue-200 bg-white/70 p-4 shadow-sm sm:p-5">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                              Available Times
                            </h2>

                            <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
                              {formatDisplayDate(selectedDate)}
                            </p>
                          </div>
                        </div>

                        {slots.length === 0 ? (
                          <div className="rounded-xl border border-blue-200 bg-white px-4 py-5 text-center text-base font-medium text-slate-700 shadow-sm">
                            No availability found for this date.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {slots.map((slot) => (
                              <button
                                key={`${slot.start.getTime()}-${slot.end.getTime()}`}
                                type="button"
                                disabled={slot.blocked}
                                onClick={() => handleSlotClick(slot)}
                                className={`rounded-xl border-2 px-5 py-4 text-left transition duration-200 ${
                                  slot.blocked
                                    ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500"
                                    : "cursor-pointer border-teal-700 bg-white text-slate-800 hover:border-blue-500 hover:bg-teal-50"
                                }`}
                              >
                                <p className="text-lg font-bold">
                                  {slot.label}
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                  {slot.blocked
                                    ? "Unavailable"
                                    : "Click to schedule"}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {confirmModal}
      {successModal}
    </>
  );
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}
