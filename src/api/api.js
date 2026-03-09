import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    login: (data) => api.post('/users/login', data),
    signup: (data) => api.post('/users/signup', data),
};

// Quiz endpoints
export const quizAPI = {
    getAll: () => api.get('/quizzes'),
    getById: (id) => api.get(`/quizzes/${id}`),
    create: (data) => api.post('/quizzes', data),
    update: (id, data) => api.put(`/quizzes/${id}`, data),
    delete: (id) => api.delete(`/quizzes/${id}`),
    addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/question`, data),
    addExistingQuestions: (quizId, questionIds) => api.post(`/quizzes/${quizId}/questions/existing`, { questionIds }),
    removeExistingQuestion: (quizId, questionId) => api.delete(`/quizzes/${quizId}/questions/${questionId}`),
};

// Question endpoints
export const questionAPI = {
    getAll: () => api.get('/questions'),
    getById: (id) => api.get(`/questions/${id}`),
    create: (data) => api.post('/questions', data),
    update: (id, data) => api.put(`/questions/${id}`, data),
    delete: (id) => api.delete(`/questions/${id}`),
};

export default api;
