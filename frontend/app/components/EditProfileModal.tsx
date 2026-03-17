'use client';

import React from 'react';

type EditProfileModalProps = {
  open: boolean;
  username: string;
  bio: string;
  onChangeUsername: (v: string) => void;
  onChangeBio: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  username,
  bio,
  onChangeUsername,
  onChangeBio,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold text-gray-100 mb-6">Edit Profile</h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              placeholder="Your username"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
              value={username}
              onChange={(e) => onChangeUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none"
              value={bio}
              onChange={(e) => onChangeBio(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#00ff88] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#00d4ff] transition-all"
            >
              Save
            </button>
            <button
              type="button"
              className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
