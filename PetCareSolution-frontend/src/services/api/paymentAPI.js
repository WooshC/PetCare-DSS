import axios from 'axios';

const BASE_URL = 'http://localhost:5012/api/Payment';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentService = {
    createOrder: async (paymentRequest) => {
        try {
            const response = await axios.post(`${BASE_URL}/create-order`, paymentRequest, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            // The controller returns the raw PayPal response string.
            // If axios auto-parses JSON, response.data might be an object if the backend sent application/json
            // If the backend sent text/plain, response.data is a string.

            if (typeof response.data === 'string') {
                try {
                    return JSON.parse(response.data);
                } catch (e) {
                    return response.data;
                }
            }
            return response.data;
        } catch (error) {
            console.error("Error creating PayPal order:", error);
            throw error;
        }
    }
};
