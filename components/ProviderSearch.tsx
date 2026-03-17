"use client";

import { useState } from "react";
import ProviderCard from "./ProviderCard";

type Provider = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  state: string;
};

export default function ProviderSearch() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function fetchProviders() {
    setLoading(true);
    setHasSearched(true);

    const params = new URLSearchParams();

    if (firstName) params.set("firstName", firstName);
    if (lastName) params.set("lastName", lastName);
    if (state) params.set("state", state);
    if (specialty) params.set("specialty", specialty);

    const response = await fetch(`/api/providers?${params.toString()}`);

    if (!response.ok) {
      setLoading(false);
      throw new Error("Failed to fetch providers");
    }

    const data = await response.json();

    setProviders(data);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      fetchProviders();
      setFirstName("");
      setLastName("");
      setState("");
      setSpecialty("");
    }
  }

  return (
    <section
      className={`w-full transition-all duration-300 ${
        hasSearched ? "max-w-6xl" : "max-w-4xl"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border-4 border-blue-500 bg-teal-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="bg-blue-300 px-6 py-6 sm:px-8 sm:py-7">
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Find a Provider
          </h1>
          <p className="mt-3 text-center text-sm font-medium text-white/90 sm:text-base md:text-lg">
            Search by doctor name, state, or specialty to book your appointment.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10">
          <div className="rounded-2xl border-2 border-blue-200 bg-white/70 p-4 shadow-sm sm:p-5">
            <div
              className={`grid gap-4 ${
                hasSearched
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-5 xl:items-end"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              <div className={hasSearched ? "xl:col-span-1" : ""}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Doctor first name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-xl border-2 border-teal-700 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className={hasSearched ? "xl:col-span-1" : ""}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Doctor last name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lee"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-xl border-2 border-teal-700 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className={hasSearched ? "xl:col-span-1" : ""}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-xl border-2 border-teal-700 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-blue-500"
                >
                  <option value="">All States</option>
                  <option value="FL">Florida</option>
                  <option value="NY">New York</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                </select>
              </div>

              <div className={hasSearched ? "xl:col-span-1" : ""}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-xl border-2 border-teal-700 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-blue-500"
                >
                  <option value="">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>

              <div className={hasSearched ? "xl:col-span-1" : "md:col-span-2"}>
                <button
                  onClick={fetchProviders}
                  className="h-12 w-full rounded-xl bg-teal-500 px-6 text-base font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-teal-600 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-xl border border-blue-200 bg-white px-4 py-5 text-center text-base font-medium text-slate-700 shadow-sm">
              Loading providers...
            </div>
          )}

          {hasSearched && !loading && providers.length === 0 && (
            <div className="mt-8 rounded-xl border border-blue-200 bg-white px-4 py-5 text-center text-base font-medium text-slate-700 shadow-sm">
              No providers found.
            </div>
          )}

          {hasSearched && !loading && providers.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
