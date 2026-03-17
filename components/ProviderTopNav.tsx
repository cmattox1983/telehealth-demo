"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import LogoutButton from "./Logout";
import ProviderSideNav from "./ProviderSideNav";

type LoggedInUser = {
  id: number;
  email: string;
  role: string;
  patientId: number | null;
  providerId: number | null;
};

type ProviderSidebarResponse = {
  provider: {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string;
    state: string;
  };
  upcomingAppointments: unknown[];
  alerts: unknown[];
};

export default function ProviderTopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [welcomeName, setWelcomeName] = useState("Provider");

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    async function fetchProviderName() {
      try {
        const storedUser = localStorage.getItem("loggedInUser");

        if (!storedUser) return;

        const loggedInUser: LoggedInUser = JSON.parse(storedUser);

        if (loggedInUser.role !== "PROVIDER" || !loggedInUser.providerId)
          return;

        const response = await fetch(
          `/api/provider-sidebar/${loggedInUser.providerId}`,
        );

        const data: ProviderSidebarResponse = await response.json();

        if (!response.ok) return;

        setWelcomeName(`Dr. ${data.provider.lastName}`);
      } catch (error) {
        console.error("Error loading provider top nav:", error);
      }
    }

    fetchProviderName();
  }, []);

  return (
    <>
      <nav className="bg-blue-300 py-4">
        <div className="row">
          <div className="flex h-16 w-full items-center justify-between">
            <Image
              src="/mytelehealth-logo.svg"
              alt="MyTeleHealth logo"
              width={180}
              height={60}
              className="h-12 w-auto sm:h-14 md:h-16"
            />

            <div className="hidden items-center gap-4 lg:flex xl:gap-6">
              <p className="rounded-md px-3 py-2 text-lg font-bold text-white xl:text-2xl">
                Welcome, {welcomeName}!
              </p>
              <LogoutButton />
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              className="ml-auto inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-white transition duration-200 hover:scale-110 lg:hidden"
              aria-controls="provider-mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open provider menu</span>
              <svg
                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div id="provider-mobile-menu" className="mt-3 lg:hidden">
              <div className="mb-4 flex justify-end">
                <p className="rounded-md px-3 py-2 text-right text-lg font-bold text-white">
                  Welcome, {welcomeName}!
                </p>
              </div>

              <div className="mb-4 flex justify-end">
                <LogoutButton />
              </div>

              <div className="overflow-hidden rounded-xl bg-red-100 shadow-lg">
                <ProviderSideNav isMobile onClose={closeMenu} />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
