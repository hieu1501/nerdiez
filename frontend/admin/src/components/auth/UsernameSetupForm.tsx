"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/button/Button";

export default function UsernameSetupForm() {
  const { user, setUsername } = useAuth();
  const [username, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      await setUsername(username.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Choose your username
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {user?.email ? `Welcome, ${user.email}!` : "Pick a unique username to get started."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter your username"
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            This will be your public display name.
          </p>
        </div>

        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="sm"
          disabled={loading}
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
