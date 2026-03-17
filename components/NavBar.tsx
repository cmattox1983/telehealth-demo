"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
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
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-lg font-bold text-white transition duration-200 hover:scale-110"
            >
              Login
            </Link>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-lg font-medium text-white hover:cursor-not-allowed"
            >
              About
            </a>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-lg font-medium text-white hover:cursor-not-allowed"
            >
              Help
            </a>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-white transition duration-200 hover:scale-110 cursor-pointer lg:hidden"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
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
          <div
            id="mobile-menu"
            className="mt-3 flex flex-col items-end gap-2 lg:hidden"
          >
            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-md px-3 py-2 text-lg font-bold text-white transition duration-200 hover:scale-110"
            >
              Login
            </Link>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-lg font-medium text-white hover:cursor-not-allowed"
            >
              About
            </a>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-lg font-medium text-white hover:cursor-not-allowed"
            >
              Help
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
