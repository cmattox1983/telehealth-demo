import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-6 rounded-lg border-4 border-blue-500 bg-teal-100 px-5 pt-8 pb-8 sm:max-w-[420px] sm:px-8 sm:pt-10 sm:pb-10 md:max-w-md md:px-10 md:pt-12 md:pb-12">
        <h1 className="flex h-16 w-full flex-col items-center justify-center bg-blue-300 text-center text-3xl font-bold text-white sm:h-[72px] sm:text-4xl md:h-[76px]">
          Login As:
        </h1>

        <Link
          href="/login/patient"
          className="flex items-center justify-center h-14 w-full max-w-[230px] rounded-md bg-teal-500 px-8 text-xl font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-teal-600 sm:mt-8 sm:h-16 sm:max-w-[240px] sm:text-2xl cursor-pointer"
        >
          Patient
        </Link>

        <div className="my-5 flex w-full items-center gap-3 sm:my-6 sm:w-3/4 sm:gap-4">
          <hr className="flex-1 border-t border-black" />
          <div className="text-lg font-bold sm:text-xl">OR</div>
          <hr className="flex-1 border-t border-black" />
        </div>

        <Link
          href="/login/provider"
          className="flex items-center justify-center h-14 w-full max-w-[230px] rounded-md bg-teal-500 px-8 text-xl font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-teal-600 sm:h-16 sm:max-w-[240px] sm:text-2xl cursor-pointer"
        >
          Provider
        </Link>

        <div className="my-5 flex w-full items-center gap-3 sm:my-6 sm:w-3/4 sm:gap-4">
          <hr className="flex-1 border-t border-black" />
          <div className="text-lg font-bold sm:text-xl">OR</div>
          <hr className="flex-1 border-t border-black" />
        </div>

        <Link
          href="/login/admin"
          className="flex items-center justify-center h-14 w-full max-w-[230px] rounded-md bg-teal-500 px-8 text-xl font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-teal-600 sm:h-16 sm:max-w-[240px] sm:text-2xl cursor-pointer"
        >
          Admin
        </Link>
        <Link
          href="/"
          className="text-center text-base font-medium text-teal-500 sm:text-lg"
        >
          Go Back to Home Page
        </Link>

        <div className="h-8 sm:h-10 md:h-12"></div>
      </div>
    </div>
  );
}
