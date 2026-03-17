"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProviderTopNav from "@/components/ProviderTopNav";
import ProviderSideNav from "@/components/ProviderSideNav";
import ProviderCalendar from "@/components/ProviderCalendar";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
};

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "PROVIDER") {
      router.push("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/provider-appointments");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100">
      <ProviderTopNav />

      <div className="flex min-h-[calc(100vh-6rem)] flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-[320px] lg:flex-shrink-0">
          <ProviderSideNav />
        </div>

        <div className="flex flex-1 px-2 py-4 sm:px-4 sm:py-6 lg:px-10 lg:py-8">
          <div className="w-full">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-600">Loading appointments...</p>
              </div>
            ) : (
              <ProviderCalendar events={events} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
