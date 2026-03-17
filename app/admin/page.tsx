"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSideNav from "@/components/AdminSideNav";
import AdminTopNav from "@/components/AdminTopNav";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "ADMIN") {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminTopNav />

      <div className="flex min-h-[calc(100vh-6rem)] flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-[320px] lg:flex-shrink-0">
          <AdminSideNav />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <section className="w-full max-w-5xl">
            <div className="overflow-hidden rounded-2xl border-4 border-gray-500 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="bg-gray-500 px-6 py-6 sm:px-8 sm:py-7">
                <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  Admin Overview
                </h1>

                <p className="mt-3 text-center text-sm font-medium text-white/90 sm:text-base md:text-lg">
                  Internal access view for role separation in this demo.
                </p>
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border-2 border-gray-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">
                      Project Focus
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-800">
                      Patient and provider scheduling workflow
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-gray-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">
                      Admin Scope
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-800">
                      Lightweight internal access layer
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-gray-200 bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">
                      Purpose
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-800">
                      Demonstrates role-based application structure
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-800">
                    About this admin view
                  </h2>

                  <p className="mt-4 text-base leading-7 text-slate-700">
                    This project is primarily focused on patient and provider
                    workflows for telehealth scheduling. The admin role is kept
                    intentionally lightweight as supporting functionality rather
                    than the core user experience.
                  </p>

                  <p className="mt-4 text-base leading-7 text-slate-700">
                    The main demonstrated features in this project include
                    provider search, appointment booking, scheduling conflict
                    prevention, patient rescheduling and cancellation, provider
                    calendar visibility, and provider alert notifications.
                  </p>

                  <div className="mt-6 rounded-xl border border-gray-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      Demo Admin Account
                    </p>
                    <p className="mt-2 text-base font-bold text-slate-800">
                      admin@test.com
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      Password: password123
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
