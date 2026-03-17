import Image from "next/image";
import Link from "next/link";
import React from "react";

const Landing = () => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="flex flex-col items-center justify-between gap-12 xl:flex-row xl:gap-16 2xl:gap-20">
            <div className="flex w-full flex-col items-start gap-6 sm:gap-7 md:gap-8 xl:w-1/2 animate-fade-up">
              <div className="text-4xl font-bold leading-tight text-black sm:text-5xl lg:text-6xl">
                Easy-schedule your next telehealth appointment
              </div>

              <div className="max-w-xl text-base leading-relaxed text-gray-800 sm:text-lg md:text-xl lg:text-2xl">
                Save time with our portal by quickly finding your provider by
                speciality and state to quickly schedule an appointment.
              </div>

              <Link
                href="/login"
                className="flex h-14 w-full max-w-[230px] items-center justify-center rounded-md bg-teal-500 px-8 text-xl font-bold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-teal-600 cursor-pointer sm:h-16 sm:max-w-[240px] sm:text-2xl"
              >
                Login
              </Link>
            </div>

            <div className="w-full xl:w-1/2 animate-fade-in-right">
              <Image
                src="/landing-image.png"
                alt="Doctor on a telehealth call"
                width={800}
                height={800}
                className="h-auto w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
