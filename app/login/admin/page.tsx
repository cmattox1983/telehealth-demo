"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin() {
    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      setLoading(true);
      setError("");

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: "ADMIN",
        }),
      });

      const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      console.log("Login successful:", data);

      localStorage.setItem("loggedInUser", JSON.stringify(data));
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);

      router.push("/admin");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) {
      handleLogin();
    }

    if (e.key === "Enter" && (!email || !password)) {
      setError("Please enter both email and password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-[340px] rounded-lg border-4 border-gray-500 bg-white sm:max-w-[420px] md:max-w-md">
        <h1 className="flex h-16 w-full items-center justify-center bg-gray-500 text-center text-3xl font-bold text-white sm:h-[72px] sm:text-4xl md:h-[76px]">
          Admin Login
        </h1>

        <div className="flex flex-col items-center px-5 pb-8 sm:px-8 sm:pb-10 md:px-10 md:pb-12">
          <div className="h-6 sm:h-8"></div>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full max-w-[260px] rounded-lg border-2 border-gray-500 bg-white !px-4 text-base outline-none sm:h-14 sm:max-w-[280px] sm:text-lg md:max-w-[300px]"
          />

          <div className="h-4 sm:h-5"></div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full max-w-[260px] rounded-lg border-2 border-gray-500 bg-white !px-4 text-base outline-none sm:h-14 sm:max-w-[280px] sm:text-lg md:max-w-[300px]"
          />

          <div className="h-4"></div>

          {error && (
            <p className="w-full max-w-[260px] text-center text-sm font-medium text-red-600 sm:max-w-[280px] md:max-w-[300px]">
              {error}
            </p>
          )}

          <div className="h-6 sm:h-8"></div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex h-14 w-full max-w-[260px] items-center justify-center rounded-md bg-gray-500 px-8 text-xl font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70 sm:h-16 sm:max-w-[280px] sm:text-2xl md:max-w-[300px]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="h-1"></div>

          <Link
            href="/login"
            className="text-center text-base font-medium text-red-500 sm:text-lg"
          >
            Go Back to Role Selection
          </Link>

          <div className="h-5 sm:h-6"></div>

          <div className="cursor-not-allowed text-center text-base font-medium text-blue-500 sm:text-lg">
            Forgot your password?
          </div>

          <div className="h-4 sm:h-2"></div>
        </div>

        <div className="flex h-12 w-full items-center justify-center bg-gray-300 px-4 sm:h-14">
          <div className="cursor-not-allowed text-center text-base font-medium text-blue-500 sm:text-lg">
            Don't have an account?
          </div>
        </div>
      </div>
    </div>
  );
}
