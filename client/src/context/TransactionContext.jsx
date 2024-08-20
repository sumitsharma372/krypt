import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState("0");
  const [tokens, setTokens] = useState([]);
  const [watchList, setWatchList] = useState([]);
  const [watchListBalances, setWatchListBalances] = useState({});

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        await getAccountBalance(accounts[0]);
        await getAllTokens(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();

        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const getAccountBalance = async (account) => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllTokens = async (account) => {
    try {
      if (ethereum) {
        const tokenAddresses = watchList; // Use the watch list to get token addresses
        const provider = new ethers.providers.Web3Provider(ethereum);
        const tokenBalances = await Promise.all(tokenAddresses.map(async (address) => {
          try {
            const tokenContract = new ethers.Contract(address, [
              "function balanceOf(address) view returns (uint256)",
              "function symbol() view returns (string)"
            ], provider);
            const balance = await tokenContract.balanceOf(account);
            const symbol = await tokenContract.symbol();
            return { address, symbol, balance: ethers.utils.formatUnits(balance, 18) };
          } catch (tokenError) {
            console.log(`Error fetching balance for token ${address}:`, tokenError);
            return { address, symbol: "Unknown", balance: "0" };
          }
        }));
        console.log(tokenBalances);
        setTokens(tokenBalances);
        const balanceMap = {};
        tokenBalances.forEach(token => {
          balanceMap[token.address] = token.balance;
        });
        setWatchListBalances(balanceMap);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  

  const addTokenToWatchList = async (tokenAddress) => {
    if (!watchList.includes(tokenAddress)) {
      setWatchList([...watchList, tokenAddress]);
      await getAllTokens(currentAccount);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const connectWalletWithAddress = async (address) => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      if (accounts && accounts[0].caveats[0].value.includes(address.toLowerCase())) {
        setCurrentAccount(address.toLowerCase());
        await getAccountBalance(address);
        await getAllTokens(address);
        getAllTransactions();
      } else {
        alert("Address not found in connected accounts.");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
    setBalance("0");
    setTokens([]);
    setWatchList([]);
    setWatchListBalances({});
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        await transactionHash.wait();
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
        balance,
        tokens,
        watchList,
        watchListBalances,
        addTokenToWatchList,
        connectWalletWithAddress,
        disconnectWallet,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
