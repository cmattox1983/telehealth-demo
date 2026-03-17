"use client";

import { useCallback, useEffect, useState } from "react";

type PatientSideNavProps = {
  isMobile?: boolean;
  onClose?: () => void;
};

type LoggedInUser = {
  id: number;
  email: string;
  role: string;
  patientId: number | null;
  providerId: number | null;
};

type PatientProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  state: string;
};

type UpcomingAppointment = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  provider: {
    firstName: string;
    lastName: string;
    specialty: string;
    state: string;
  };
};

type PatientSidebarResponse = {
  patient: PatientProfile;
  upcomingAppointments: UpcomingAppointment[];
};

export default function PatientSideNav({
  isMobile = false,
  onClose,
}: PatientSideNavProps) {
  const [openSection, setOpenSection] = useState<"profile" | "upcoming" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<PatientSidebarResponse | null>(
    null,
  );
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const fetchSidebarData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        setError("No logged-in patient found.");
        return;
      }

      const loggedInUser: LoggedInUser = JSON.parse(storedUser);

      if (loggedInUser.role !== "PATIENT" || !loggedInUser.patientId) {
        setError("Patient profile not found.");
        return;
      }

      const response = await fetch(
        `/api/patient-sidebar/${loggedInUser.patientId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load sidebar data");
      }

      setSidebarData(data);
    } catch (error) {
      console.error("Error loading patient sidebar:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load patient sidebar data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  function toggleSection(section: "profile" | "upcoming") {
    setOpenSection((prev) => (prev === section ? null : section));
  }

  async function handleCancelAppointment(appointmentId: number) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmCancel) return;

    try {
      setActionLoadingId(appointmentId);
      setActionMessage("");

      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        throw new Error("No logged-in patient found.");
      }

      const loggedInUser: LoggedInUser = JSON.parse(storedUser);

      if (!loggedInUser.patientId) {
        throw new Error("Patient profile not found.");
      }

      const response = await fetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: loggedInUser.patientId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      setActionMessage("Appointment cancelled successfully.");
      setReschedulingId(null);
      await fetchSidebarData();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Failed to cancel appointment.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleOpenReschedule(appointment: UpcomingAppointment) {
    setActionMessage("");
    setReschedulingId(appointment.id);
    setRescheduleDate(toDateInputValue(appointment.startTime));
    setRescheduleTime(toTimeInputValue(appointment.startTime));
  }

  function handleCloseReschedule() {
    setReschedulingId(null);
    setRescheduleDate("");
    setRescheduleTime("");
  }

  async function handleSaveReschedule(appointmentId: number) {
    try {
      setActionLoadingId(appointmentId);
      setActionMessage("");

      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        throw new Error("No logged-in patient found.");
      }

      const loggedInUser: LoggedInUser = JSON.parse(storedUser);

      if (!loggedInUser.patientId) {
        throw new Error("Patient profile not found.");
      }

      if (!rescheduleDate || !rescheduleTime) {
        throw new Error("Please choose both a date and time.");
      }

      const newStart = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
      const newEnd = new Date(newStart);
      newEnd.setMinutes(newEnd.getMinutes() + 30);

      const response = await fetch(
        `/api/appointments/${appointmentId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: loggedInUser.patientId,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reschedule appointment");
      }

      setActionMessage("Appointment rescheduled successfully.");
      setReschedulingId(null);
      setRescheduleDate("");
      setRescheduleTime("");
      await fetchSidebarData();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Failed to reschedule appointment.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  const baseItem =
    "w-full text-left text-2xl font-semibold text-slate-700 transition duration-200";
  const clickable = "cursor-pointer hover:text-blue-600";
  const disabled = "cursor-not-allowed";
  const panelClass =
    "mt-3 rounded-2xl border-2 border-blue-200 bg-white/80 p-4 shadow-sm";
  const labelClass = "text-sm font-semibold text-slate-500";
  const valueClass = "mt-1 text-base font-bold text-slate-800";
  const sectionButtonClass =
    "flex w-full items-center justify-between gap-3 text-left";

  return (
    <aside
      className={`h-full w-full bg-teal-100 ${
        isMobile ? "p-4 sm:p-6" : "px-4 py-6 sm:px-6 sm:py-8"
      }`}
    >
      {isMobile && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-4xl font-bold text-slate-700 transition duration-200 hover:text-blue-600"
            aria-label="Close patient menu"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <button
            type="button"
            className={`${baseItem} ${clickable} ${sectionButtonClass}`}
            onClick={() => toggleSection("profile")}
          >
            <span className="text-xl sm:text-2xl">My Profile</span>
            <span className="text-2xl font-bold">
              {openSection === "profile" ? "−" : "+"}
            </span>
          </button>

          {openSection === "profile" && (
            <div className={panelClass}>
              {loading && (
                <p className="text-sm font-medium text-slate-600">
                  Loading profile...
                </p>
              )}

              {!loading && error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              {!loading && !error && sidebarData?.patient && (
                <div className="grid gap-4">
                  <div>
                    <p className={labelClass}>Name</p>
                    <p className={valueClass}>
                      {sidebarData.patient.firstName}{" "}
                      {sidebarData.patient.lastName}
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>Email</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                      {sidebarData.patient.email}
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>State</p>
                    <p className={valueClass}>{sidebarData.patient.state}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            className={`${baseItem} ${clickable} ${sectionButtonClass}`}
            onClick={() => toggleSection("upcoming")}
          >
            <span className="text-xl sm:text-2xl">Upcoming Appointments</span>
            <span className="text-2xl font-bold">
              {openSection === "upcoming" ? "−" : "+"}
            </span>
          </button>

          {openSection === "upcoming" && (
            <div className={panelClass}>
              {loading && (
                <p className="text-sm font-medium text-slate-600">
                  Loading appointments...
                </p>
              )}

              {!loading && error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              {!loading && !error && actionMessage && (
                <p className="mb-4 text-sm font-medium text-teal-700">
                  {actionMessage}
                </p>
              )}

              {!loading &&
                !error &&
                sidebarData?.upcomingAppointments?.length === 0 && (
                  <p className="text-sm font-medium text-slate-600">
                    No upcoming appointments found.
                  </p>
                )}

              {!loading &&
                !error &&
                sidebarData?.upcomingAppointments &&
                sidebarData.upcomingAppointments.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {sidebarData.upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="rounded-xl border border-blue-100 bg-white px-4 py-4 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-slate-500">
                          Provider
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-800">
                          Dr. {appointment.provider.firstName}{" "}
                          {appointment.provider.lastName}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Specialty
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {appointment.provider.specialty}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Date
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatDisplayDate(appointment.startTime)}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Time
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatTimeRange(
                            appointment.startTime,
                            appointment.endTime,
                          )}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-bold text-teal-700">
                          {appointment.status}
                        </p>

                        <div className="mt-5 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            disabled={actionLoadingId === appointment.id}
                            style={{
                              display: "flex",
                              width: "100%",
                              height: "44px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "12px",
                              border: "2px solid #dc2626",
                              backgroundColor: "#ef4444",
                              color: "#ffffff",
                              fontSize: "14px",
                              fontWeight: 700,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                              cursor:
                                actionLoadingId === appointment.id
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                actionLoadingId === appointment.id ? 0.7 : 1,
                            }}
                          >
                            {actionLoadingId === appointment.id
                              ? "Processing..."
                              : "Cancel Appointment"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReschedule(appointment)}
                            disabled={actionLoadingId === appointment.id}
                            style={{
                              display: "flex",
                              width: "100%",
                              height: "44px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "12px",
                              border: "2px solid #2563eb",
                              backgroundColor: "#3b82f6",
                              color: "#ffffff",
                              fontSize: "14px",
                              fontWeight: 700,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                              cursor:
                                actionLoadingId === appointment.id
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                actionLoadingId === appointment.id ? 0.7 : 1,
                            }}
                          >
                            Reschedule Appointment
                          </button>
                        </div>

                        {reschedulingId === appointment.id && (
                          <div className="mt-4 rounded-xl border border-blue-200 bg-teal-50 p-4">
                            <p className="text-sm font-semibold text-slate-700">
                              Choose a new date and time
                            </p>

                            <div className="mt-3 grid gap-3">
                              <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) =>
                                  setRescheduleDate(e.target.value)
                                }
                                className="h-11 w-full rounded-xl border-2 border-teal-700 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                              />

                              <input
                                type="time"
                                value={rescheduleTime}
                                onChange={(e) =>
                                  setRescheduleTime(e.target.value)
                                }
                                className="h-11 w-full rounded-xl border-2 border-teal-700 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                                step={1800}
                              />
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveReschedule(appointment.id)
                                }
                                disabled={actionLoadingId === appointment.id}
                                className="h-11 w-full rounded-xl bg-teal-500 px-4 text-sm font-bold text-white transition duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {actionLoadingId === appointment.id
                                  ? "Saving..."
                                  : "Save New Time"}
                              </button>

                              <button
                                type="button"
                                onClick={handleCloseReschedule}
                                disabled={actionLoadingId === appointment.id}
                                className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition duration-200 hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">Previous Appointments</span>
        </button>

        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">Change Billing Info</span>
        </button>

        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">Update Insurance</span>
        </button>
      </div>
    </aside>
  );
}

function formatDisplayDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeRange(startString: string, endString: string) {
  return `${formatTime(startString)} - ${formatTime(endString)}`;
}

function toDateInputValue(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toTimeInputValue(dateString: string) {
  const date = new Date(dateString);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${hours}:${minutes}`;
}
