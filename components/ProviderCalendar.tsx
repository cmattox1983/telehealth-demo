"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
};

type ProviderCalendarProps = {
  events: CalendarEvent[];
};

export default function ProviderCalendar({ events }: ProviderCalendarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Appointment Schedule
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your upcoming telehealth appointments.
        </p>
      </div>

      <div className={isMobile ? "w-full" : "overflow-x-auto"}>
        <div className={isMobile ? "w-full" : "min-w-[980px]"}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
            headerToolbar={
              isMobile
                ? {
                    left: "prev,next",
                    center: "title",
                    right: "today",
                  }
                : {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }
            }
            buttonText={{
              today: "today",
              month: "month",
              week: "week",
              day: "day",
            }}
            events={events}
            height="auto"
            dayHeaderFormat={
              isMobile
                ? {
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                  }
                : {
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                  }
            }
            allDaySlot={!isMobile}
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
          />
        </div>
      </div>
    </div>
  );
}
