import React from "react";

interface LoseStreakModalProps {
  open: boolean;
  onClose: () => void;
}

const LoseStreakModal: React.FC<LoseStreakModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Streak Lost!</h2>
        <p className="mb-6">You lost your streak. Don't give up, try again!</p>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoseStreakModal; 