import React from "react";
import ReactDOM from "react-dom";

const HistoricalBalanceModal = ({ isOpen, onClose, tokenData }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Historical Balances for {tokenData.symbol}</h2>
        <ul>
          {tokenData.history.map((entry, index) => (
            <li key={index} className="mb-2">
              <p>Date: {entry.date}, Balance: {entry.balance}</p>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default HistoricalBalanceModal;
