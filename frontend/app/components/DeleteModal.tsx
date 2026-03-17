'use client';

import React from 'react';

type DeleteModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-100 mb-4">Delete Article?</h3>
        <p className="text-gray-400 mb-6">
          This action cannot be undone. All comments will also be deleted.
        </p>
        <div className="flex gap-4">
          <button
            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-all"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
