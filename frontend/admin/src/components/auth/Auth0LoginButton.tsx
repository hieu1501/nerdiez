"use client";

interface Auth0LoginButtonProps {
  label?: string;
}

export default function Auth0LoginButton({
  label = "Continue with Auth0",
}: Auth0LoginButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = "/auth/login";
      }}
      className="flex items-center justify-center w-full gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-full hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.49 11.07c-.31.83-.94 1.58-1.81 2.19-.87.61-1.85.92-2.94.92-.9 0-1.76-.2-2.56-.58V8.82c.8-.4 1.66-.6 2.56-.6 1.08 0 2.05.3 2.91.89.87.6 1.49 1.43 1.81 2.5h-1.47c-.26-.67-.69-1.2-1.28-1.58-.59-.39-1.25-.58-1.97-.58-.8 0-1.51.2-2.13.61-.62.41-1.1.98-1.44 1.71s-.52 1.53-.52 2.39c0 .87.18 1.65.54 2.37.36.71.85 1.27 1.47 1.67.62.41 1.33.61 2.12.61.74 0 1.4-.19 1.99-.58.59-.39 1.02-.94 1.28-1.64h1.47z" />
      </svg>
      {label}
    </button>
  );
}
