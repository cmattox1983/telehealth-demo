"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProviderSearch from "@/components/ProviderSearch";
import PatientTopNav from "@/components/PatientTopNav";
import PatientSideNav from "@/components/PatientSideNav";

export default function PatientSearchPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "PATIENT") {
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-100">
      <PatientTopNav />

      <div className="flex min-h-[calc(100vh-6rem)] flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-[320px] lg:flex-shrink-0">
          <PatientSideNav />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <ProviderSearch />
        </div>
      </div>
    </main>
  );
}
