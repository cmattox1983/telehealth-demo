import Link from "next/link";

type Provider = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  state: string;
};

type ProviderCardProps = {
  provider: Provider;
};

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="bg-blue-100 px-5 py-4">
        <h2 className="text-center text-2xl font-bold text-slate-800">
          Dr. {provider.firstName} {provider.lastName}
        </h2>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Specialty
          </span>
          <span className="text-base font-medium text-slate-800">
            {provider.specialty}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            State
          </span>
          <span className="text-base font-medium text-slate-800">
            {provider.state}
          </span>
        </div>
      </div>

      <div className="bg-slate-200 px-5 py-4">
        <Link
          href={`/patient/providers/${provider.id}`}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-teal-500 px-6 text-base font-bold text-white transition duration-300 hover:bg-teal-600"
        >
          Book Appointment
        </Link>
      </div>
    </article>
  );
}
