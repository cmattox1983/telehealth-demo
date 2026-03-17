"use client";

import { useEffect, useState } from "react";

type ProviderSideNavProps = {
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

type ProviderProfile = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  state: string;
};

type UpcomingAppointment = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    state: string;
  };
};

type ProviderAlert = {
  id: number;
  type: string;
  patientName: string;
  oldStartTime: string | null;
  newStartTime: string | null;
  createdAt: string;
};

type ProviderSidebarResponse = {
  provider: ProviderProfile;
  upcomingAppointments: UpcomingAppointment[];
  alerts: ProviderAlert[];
};

export default function ProviderSideNav({
  isMobile = false,
  onClose,
}: ProviderSideNavProps) {
  const [openSection, setOpenSection] = useState<
    "profile" | "upcoming" | "alerts" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [sidebarData, setSidebarData] =
    useState<ProviderSidebarResponse | null>(null);
  const [error, setError] = useState("");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("loggedInUser");

        if (!storedUser) {
          setError("No logged-in provider found.");
          return;
        }

        const loggedInUser: LoggedInUser = JSON.parse(storedUser);

        if (loggedInUser.role !== "PROVIDER" || !loggedInUser.providerId) {
          setError("Provider profile not found.");
          return;
        }

        setProviderId(loggedInUser.providerId);

        const storageKey = `providerAlertsSeen:${loggedInUser.providerId}`;
        const storedSeenId = Number(localStorage.getItem(storageKey) || "0");

        const response = await fetch(
          `/api/provider-sidebar/${loggedInUser.providerId}`,
        );

        const data: ProviderSidebarResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            (data as { error?: string }).error || "Failed to load sidebar data",
          );
        }

        setSidebarData(data);

        if (data.alerts && data.alerts.length > 0) {
          const newestAlertId = Math.max(
            ...data.alerts.map((alert) => alert.id),
          );
          setHasUnreadAlerts(newestAlertId > storedSeenId);
        } else {
          setHasUnreadAlerts(false);
        }
      } catch (error) {
        console.error("Error loading provider sidebar:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load provider sidebar data.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSidebarData();
  }, []);

  function markAlertsAsSeen() {
    if (
      !providerId ||
      !sidebarData?.alerts ||
      sidebarData.alerts.length === 0
    ) {
      setHasUnreadAlerts(false);
      return;
    }

    const newestAlertId = Math.max(
      ...sidebarData.alerts.map((alert) => alert.id),
    );
    localStorage.setItem(
      `providerAlertsSeen:${providerId}`,
      String(newestAlertId),
    );
    setHasUnreadAlerts(false);
  }

  function toggleSection(section: "profile" | "upcoming" | "alerts") {
    setOpenSection((prev) => {
      const nextSection = prev === section ? null : section;

      if (nextSection === "alerts") {
        markAlertsAsSeen();
      }

      return nextSection;
    });
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
      className={`h-full w-full bg-red-100 ${
        isMobile ? "p-4 sm:p-6" : "px-4 py-6 sm:px-6 sm:py-8"
      }`}
    >
      {isMobile && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-4xl font-bold text-slate-700 transition duration-200 hover:text-blue-600"
            aria-label="Close provider menu"
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

              {!loading && !error && sidebarData?.provider && (
                <div className="grid gap-4">
                  <div>
                    <p className={labelClass}>Name</p>
                    <p className={valueClass}>
                      Dr. {sidebarData.provider.firstName}{" "}
                      {sidebarData.provider.lastName}
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>Specialty</p>
                    <p className={valueClass}>
                      {sidebarData.provider.specialty}
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>State</p>
                    <p className={valueClass}>{sidebarData.provider.state}</p>
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
                        className="rounded-xl border border-blue-100 bg-white px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-slate-500">
                          Patient
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-800">
                          {appointment.patient.firstName}{" "}
                          {appointment.patient.lastName}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Email
                        </p>
                        <p className="mt-1 break-words text-sm font-bold text-slate-800">
                          {appointment.patient.email}
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
                        <p className="mt-1 text-sm font-bold text-red-600">
                          {appointment.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            className={`${baseItem} ${clickable} ${sectionButtonClass}`}
            onClick={() => toggleSection("alerts")}
          >
            <span className="inline-flex items-center gap-3 text-xl sm:text-2xl">
              Alerts
              {hasUnreadAlerts && (
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "9999px",
                    backgroundColor: "#dc2626",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
                    flexShrink: 0,
                  }}
                />
              )}
            </span>

            <span className="text-2xl font-bold">
              {openSection === "alerts" ? "−" : "+"}
            </span>
          </button>

          {openSection === "alerts" && (
            <div className={panelClass}>
              {loading && (
                <p className="text-sm font-medium text-slate-600">
                  Loading alerts...
                </p>
              )}

              {!loading && error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              {!loading && !error && sidebarData?.alerts?.length === 0 && (
                <p className="text-sm font-medium text-slate-600">
                  No alerts found.
                </p>
              )}

              {!loading &&
                !error &&
                sidebarData?.alerts &&
                sidebarData.alerts.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {sidebarData.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-4"
                      >
                        <p className="text-sm font-bold text-red-700">
                          {getAlertText(alert)}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {formatDisplayDateTime(alert.createdAt)}
                        </p>
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

function formatDisplayDateTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAlertText(alert: {
  type: string;
  patientName: string;
  oldStartTime: string | null;
  newStartTime: string | null;
}) {
  if (alert.type === "PATIENT_APPOINTMENT_SCHEDULED") {
    return `${alert.patientName} scheduled a new appointment for ${
      alert.newStartTime
        ? formatDisplayDateTime(alert.newStartTime)
        : "a new time"
    }.`;
  }

  if (alert.type === "PATIENT_APPOINTMENT_CANCELLED") {
    return `${alert.patientName} cancelled an appointment scheduled for ${
      alert.oldStartTime
        ? formatDisplayDateTime(alert.oldStartTime)
        : "a previous time"
    }.`;
  }

  if (alert.type === "PATIENT_APPOINTMENT_RESCHEDULED") {
    return `${alert.patientName} rescheduled an appointment from ${
      alert.oldStartTime
        ? formatDisplayDateTime(alert.oldStartTime)
        : "the previous time"
    } to ${
      alert.newStartTime
        ? formatDisplayDateTime(alert.newStartTime)
        : "a new time"
    }.`;
  }

  return "New provider alert.";
}
