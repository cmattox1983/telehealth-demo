"use client";

type AdminSideNavProps = {
  isMobile?: boolean;
  onClose?: () => void;
};

export default function AdminSideNav({
  isMobile = false,
  onClose,
}: AdminSideNavProps) {
  const baseItem =
    "w-full text-left text-2xl font-semibold text-slate-700 transition duration-200";
  const disabled = "cursor-default";

  return (
    <aside
      className={`h-full w-full bg-white ${isMobile ? "p-4 sm:p-6" : "px-4 py-6 sm:px-6 sm:py-8"}`}
    >
      {isMobile && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-4xl font-bold text-slate-700 transition duration-200 hover:text-gray-600"
            aria-label="Close admin menu"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:gap-6">
        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">Admin Overview</span>
        </button>

        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">Role Access</span>
        </button>

        <button type="button" className={`${baseItem} ${disabled}`}>
          <span className="text-xl sm:text-2xl">System Summary</span>
        </button>
      </div>
    </aside>
  );
}
