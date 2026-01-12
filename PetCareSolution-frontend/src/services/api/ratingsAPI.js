import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_RATING_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const ratingsService = {
    createRating: async (token, ratingData) => {
        try {
            const response = await api.post('/', ratingData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    },

    getRatings: async () => {
        try {
            const response = await api.get('/');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    },

    getRatingDetails: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    },

    getRatingsByCuidador: async (cuidadorId) => {
        try {
            const response = await api.get(`/cuidador/${cuidadorId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    },

    getPromedioByCuidador: async (cuidadorId) => {
        try {
            const response = await api.get(`/cuidador/${cuidadorId}/promedio`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    },

    deleteRating: async (token, id) => {
        try {
            await api.delete(`/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            throw new Error(error.response?.data || error.message);
        }
    }
};
