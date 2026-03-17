"use client";

import Image from "next/image";
import { useState } from "react";
import LogoutButton from "./Logout";
import AdminSideNav from "./AdminSideNav";

export default function AdminTopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <nav className="bg-gray-500 py-4">
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
                Welcome, Admin!
              </p>
              <LogoutButton />
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              className="ml-auto inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-white transition duration-200 hover:scale-110 lg:hidden"
              aria-controls="admin-mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open admin menu</span>
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
            <div id="admin-mobile-menu" className="mt-3 lg:hidden">
              <div className="mb-4 flex justify-end">
                <p className="rounded-md px-3 py-2 text-right text-lg font-bold text-white">
                  Welcome, Admin!
                </p>
              </div>

              <div className="mb-4 flex justify-end">
                <LogoutButton />
              </div>

              <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                <AdminSideNav isMobile onClose={closeMenu} />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
