import React from "react";
import './styles.css'

const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.0001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className={`my-2 w-full rounded-lg p-3 outline-none bg-transparent text-white border border-gray-300 text-sm white-glassmorphism ${
      type === 'date' ? 'date-input' : ''
    }`}
  />
);

const DateRangePicker = ({ startDate, setStartDate, endDate, setEndDate, onFetch }) => (
  <div className="mt-4">
    <h2 className="text-white text-lg font-semibold">Select Date Range</h2>
    <div className="flex space-x-4">
      <Input
        placeholder="Start Date"
        name="startDate"
        type="date"
        value={startDate}
        handleChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        placeholder="End Date"
        name="endDate"
        type="date"
        value={endDate}
        handleChange={(e) => setEndDate(e.target.value)}
      />
    </div>
    <button
      type="button"
      onClick={onFetch}
      className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:from-green-500 hover:to-blue-600 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      Fetch Historical Balances
    </button>

  </div>
);

export default DateRangePicker;
