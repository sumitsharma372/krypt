import React, { useContext } from "react";

import { TransactionContext } from "../context/TransactionContext";

import useFetch from "../hooks/useFetch";
import dummyData from "../utils/dummyData";
import { shortenAddress } from "../utils/shortenAddress";

const TransactionsCard = ({ addressTo, addressFrom, timestamp, message, keyword, amount, url }) => {
  const gifUrl = useFetch({ keyword });

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex flex-col items-center w-full mt-3">
        <div className="flex flex-col w-full mb-6 p-4 bg-gray-700 rounded-lg">
          <a href={`https://sepolia.etherscan.io/address/${addressFrom}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base mb-1">From: <span className="text-blue-400">{shortenAddress(addressFrom)}</span></p>
          </a>
          <a href={`https://sepolia.etherscan.io/address/${addressTo}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base mb-1">To: <span className="text-blue-400">{shortenAddress(addressTo)}</span></p>
          </a>
          <p className="text-white text-base mb-1">Amount: <span className="text-green-400">{amount} ETH</span></p>
          {message && (
            <>
              <br />
              <p className="text-white text-base">Message: <span className="text-yellow-300">{message}</span></p>
            </>
          )}
        </div>
        {/* <img
          src={gifUrl || url}
          alt="nature"
          className="w-full h-64 2xl:h-96 rounded-md shadow-lg object-cover"
        /> */}
        <div className="bg-gray-800 p-3 px-5 w-max rounded-full mt-4 shadow-lg">
          <p className="text-[#37c7da] font-bold text-lg">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};


const Transactions = () => {
  const { transactions, currentAccount } = useContext(TransactionContext);

  return (
    <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
      <div className="flex flex-col md:p-12 py-12 px-4">
        {currentAccount ? (
          <h3 className="text-white text-3xl text-center my-2">
            Latest Transactions
          </h3>
        ) : (
          <h3 className="text-white text-3xl text-center my-2">
            Connect your account to see the latest transactions
          </h3>
        )}

        <div className="flex flex-wrap justify-center items-center mt-10">
          {[...dummyData, ...transactions].reverse().map((transaction, i) => (
            <TransactionsCard key={i} {...transaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
