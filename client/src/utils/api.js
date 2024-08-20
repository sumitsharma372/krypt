import axios from 'axios';

// Set up the base URL for your backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the port if needed
});

export const fetchTokens = async (userAddress) => {
  try {
    const response = await api.get(`/tokens`, {
      params: { userAddress },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
};

export const saveTokens = async (userAddress, tokens) => {
  try {
    await api.post('/tokens', { userAddress, tokens });
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};
