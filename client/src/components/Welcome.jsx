import React, { useContext, useState, useEffect } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { SiEthereum } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import { Loader } from ".";
import { ethers } from "ethers";
import HistoricalBalanceModal from "./HistoricalBalanceModal"; 
import axios from 'axios';
import DateRangePicker from './DateRangePicker'
import { contractABI, contractAddress } from "../utils/constants";


const companyCommonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";


const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.0001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="w-full p-3 my-2 rounded-lg bg-gray-900 text-white text-base border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
  />

);

const Welcome = () => {
  const {
    currentAccount,
    connectWallet,
    connectWalletWithAddress,
    disconnectWallet,
    handleChange,
    sendTransaction,
    formData,
    isLoading,
    balance,
  } = useContext(TransactionContext);

  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [savedTokens, setSavedTokens] = useState([]);
  const [savedTokenBalances, setSavedTokenBalances] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [historicalBalances, setHistoricalBalances] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const tokensFromStorage = JSON.parse(localStorage.getItem(`tokens_${currentAccount}`)) || [];
    setSavedTokens(tokensFromStorage);
  
    const fetchTokenBalances = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const newBalances = {};
      for (const token of tokensFromStorage) {
        try {
          const tokenContract = new ethers.Contract(token.address, [
            "function balanceOf(address) view returns (uint256)"
          ], provider);
          const balance = await tokenContract.balanceOf(currentAccount);
          newBalances[token.address] = ethers.utils.formatUnits(balance, 18);
        } catch (error) {
          console.error(`Error fetching balance for token ${token.address}:`, error);
        }
      }
      setSavedTokenBalances(newBalances);
    };
  
    if (currentAccount) {
      fetchTokenBalances();
    }
  }, [currentAccount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { addressTo, amount, keyword, message } = formData;
    if (!addressTo || !amount || !keyword || !message) return;
    sendTransaction();
  };

  const handleAddToken = async (e) => {
    e.preventDefault();
    if (tokenAddress) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(tokenAddress, [
          "function symbol() view returns (string)"
        ], provider);
  
        const symbol = await tokenContract.symbol();
  
        const tokenAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: 18,
              image: 'https://sepolia.etherscan.io/images/main/empty-token.png',
            },
          },
        });
  
        if (tokenAdded) {
          alert('Token added to MetaMask!');
  
          const savedTokens = JSON.parse(localStorage.getItem(`tokens_${currentAccount}`)) || [];
          savedTokens.push({ address: tokenAddress, symbol });
          localStorage.setItem(`tokens_${currentAccount}`, JSON.stringify(savedTokens));
  
          setSavedTokens(savedTokens); 
  
          const tokenContract = new ethers.Contract(tokenAddress, [
            "function balanceOf(address) view returns (uint256)"
          ], provider);
          const balance = await tokenContract.balanceOf(currentAccount);
          setSavedTokenBalances(prevBalances => ({
            ...prevBalances,
            [tokenAddress]: ethers.utils.formatUnits(balance, 18)
          }));
  
          setTokenAddress("");
        } else {
          console.log('Token not added to MetaMask.');
        }
      } catch (error) {
        console.error('Error adding token to MetaMask:', error);
      }
    }
  };

  const handleConnectWithAddress = async (e) => {
    e.preventDefault();
    if (walletAddress) {
      await connectWalletWithAddress(walletAddress);
      setWalletAddress("");
    }
  };

  const handleTokenClick = (token) => {
    setSelectedToken(token);
    // setIsModalOpen(true);
  };

  const fetchAllBalances = async (provider, tokenAddress) => {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const allBalances = await tokenContract.getAllBalances();
    return allBalances;
  };
  
  const fetchHistoricalBalancesForDateRange = async (provider, tokenAddress, startDate, endDate) => {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    
    // Convert date strings to Unix timestamps
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
  
    const historicalData = await tokenContract.getHistoricalData(startTimestamp, endTimestamp);
    return historicalData;
  };
  
  
  const fetchHistoricalBalances = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    if (!selectedToken) {
      alert('Please select a token address.');
      return;
    }
    
    if (!startDate || !endDate) {
      console.log('Dates not set. Showing all balances.');
  
      try {
        const allBalances = await fetchAllBalances(provider, selectedToken.address);
        setHistoricalBalances(prevBalances => ({
          ...prevBalances,
          [selectedToken.address]: allBalances
        }));
      } catch (error) {
        console.error('Error fetching all balances:', error);
      }
      
      return;
    }
    
    console.log('Fetching historical balances from', startDate, 'to', endDate);
    
    try {
      const history = await fetchHistoricalBalancesForDateRange(
        provider,
        selectedToken.address,
        startDate,
        endDate
      );
  
      setHistoricalBalances(prevBalances => ({
        ...prevBalances,
        [selectedToken.address]: history
      }));
    } catch (error) {
      console.error('Error fetching historical balances:', error);
    }
  };
  
  const tokenAbi = contractABI;


  return (
    <div className="flex w-full justify-center items-center bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 min-h-screen">
  <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
    <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
      <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1 font-bold">
      Crypto Insights<br /> Portfolio & Transactions
      </h1>
      <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
      Manage your crypto assets effortlessly with Krypt. Track, transfer, and view balances in one place.
      </p>
      {!currentAccount && (
        <div>
          <button
            type="button"
            onClick={connectWallet}
            className="flex flex-row justify-center items-center my-5 bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-blue-600 hover:to-teal-600 transition-all duration-300 ease-in-out shadow-lg"
          >
            <AiFillPlayCircle className="text-white mr-2" />
            <p className="text-white text-base font-semibold">
              Connect Wallet
            </p>
          </button>

          <form onSubmit={handleConnectWithAddress}>
            <Input
              placeholder="Enter Wallet Address"
              name="walletAddress"
              type="text"
              value={walletAddress}
              handleChange={(e) => setWalletAddress(e.target.value)}
            />
            <button
              type="submit"
              className="text-white w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 border-[1px] p-2 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 ease-in-out shadow-lg"
            >
              Connect Wallet with Address
            </button>
          </form>
        </div>
      )}
      {currentAccount && (
        <div className="my-5">
          <button
            type="button"
            onClick={disconnectWallet}
            className="text-white w-6/12 mt-2 bg-gradient-to-r from-red-500 to-orange-500 border-[1px] p-2 py-3 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 transition-all duration-300 ease-in-out shadow-lg"
          >
            Disconnect Wallet
          </button>
          <h2 className="text-white text-lg font-semibold mb-2 mt-4">Account Balance</h2>
          <p className="text-white text-lg font-light">{balance} ETH</p>

          <h2 className="text-white text-lg font-semibold mt-4">Watch List</h2>
          <div className="mt-2">
            {savedTokens.map((token, index) => (
              <div key={index} className="mb-2 bg-gray-800 rounded-lg p-3 shadow-md">
                <button
                  type="button"
                  onClick={() => handleTokenClick(token)}
                  className="text-white text-lg font-light bg-gray-700 p-2 rounded-lg w-full text-left hover:bg-gray-600 transition duration-300"
                >
                  {token.symbol} ({token.address})
                </button>
                <p className="text-white text-lg font-light">
                  Balance: {savedTokenBalances[token.address] || 'Fetching...'}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddToken} className="mt-4">
            <Input
              placeholder="Enter Token Address"
              name="tokenAddress"
              type="text"
              value={tokenAddress}
              handleChange={(e) => setTokenAddress(e.target.value)}
            />
            <button
              type="submit"
              className="text-white w-full mt-2 bg-gradient-to-r from-green-500 to-blue-500 border-[1px] p-2 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 transition-all duration-300 ease-in-out shadow-lg"
            >
              Add Token to Watch List
            </button>
          </form>

          <div className="mt-4">
            <label className="text-white text-lg font-semibold mb-2 block">Select Token:</label>
            <div className="relative">
            <select
  className="appearance-none w-full bg-gray-900 text-white text-base font-medium py-3 px-4 pr-8 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out"
  value={selectedToken?.address || ""}
  onChange={(e) => {
    const selected = savedTokens.find(token => token.address === e.target.value);
    setSelectedToken(selected);
  }}
>
  <option value="" disabled className="text-gray-400">Select a token</option>
  {savedTokens.map((token, index) => (
    <option
      key={index}
      value={token.address}
      className="bg-gray-800 text-white hover:bg-blue-500 transition-colors duration-200 ease-in-out"
    >
      {token.symbol} ({shortenAddress(token.address)})
    </option>
  ))}
</select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M7 7l3-3 3 3H7zm0 6h6l-3 3-3-3z"/>
                </svg>
              </div>
            </div>
          </div>

          <DateRangePicker
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onFetch={fetchHistoricalBalances}
          />
        </div>
      )}
    </div>

    <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
      <div className="p-3 justify-end items-start flex-col rounded-xl h-40 sm:w-72 w-full my-5 eth-card bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
        <div className="flex justify-between flex-col w-full h-full">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
              <SiEthereum fontSize={21} color="#fff" />
            </div>
            <BsInfoCircle fontSize={17} color="#fff" />
          </div>
          <div>
            <p className="text-white font-light text-sm">
              {shortenAddress(currentAccount)}
            </p>
            <p className="text-white font-semibold text-lg mt-1">
              Ethereum
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-md">
        <Input placeholder="Address To" name="addressTo" type="text" handleChange={handleChange} />
        <Input placeholder="Amount (ETH)" name="amount" type="number" handleChange={handleChange} />
        <Input placeholder="Keyword (Gif)" name="keyword" type="text" handleChange={handleChange} />
        <Input placeholder="Enter Message" name="message" type="text" handleChange={handleChange} />

        <div className="h-[1px] w-full bg-gray-400 my-2" />

        {isLoading
          ? <Loader />
          : (
            <button
              type="button"
              onClick={handleSubmit}
              className="text-white w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 border-[1px] p-2 rounded-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 ease-in-out shadow-lg"
            >
              Send now
            </button>
          )}
      </div>
    </div>

    {selectedToken && (
      <HistoricalBalanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokenData={{
          symbol: selectedToken.symbol,
          history: historicalBalances[selectedToken.address] || []
        }}
      />
    )}
  </div>
</div>

  );
};

export default Welcome;
