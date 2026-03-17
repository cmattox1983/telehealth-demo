"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-white/10 px-5 py-2 text-lg font-semibold text-white transition hover:bg-white/20 cursor-pointer"
    >
      Logout
    </button>
  );
}
