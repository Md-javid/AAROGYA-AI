import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add token to requests
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Handle token expiration
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth
    async register(email: string, password: string, profile: any) {
        const { data } = await this.api.post('/auth/register', { email, password, profile });
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    async login(email: string, password: string) {
        const { data } = await this.api.post('/auth/login', { email, password });
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    async getMe() {
        const { data } = await this.api.get('/auth/me');
        return data.user;
    }

    // Logs
    async createWorkoutLog(log: any) {
        const { data } = await this.api.post('/logs/workout', log);
        return data.log;
    }

    async getWorkoutLogs() {
        const { data } = await this.api.get('/logs/workout');
        return data.logs;
    }

    async createMealLog(log: any) {
        const { data } = await this.api.post('/logs/meal', log);
        return data.log;
    }

    async getMealLogs() {
        const { data } = await this.api.get('/logs/meal');
        return data.logs;
    }

    async createSleepLog(log: any) {
        const { data } = await this.api.post('/logs/sleep', log);
        return data.log;
    }

    async getSleepLogs() {
        const { data } = await this.api.get('/logs/sleep');
        return data.logs;
    }

    async createWaterLog(log: any) {
        const { data } = await this.api.post('/logs/water', log);
        return data.log;
    }

    async getWaterLogs() {
        const { data } = await this.api.get('/logs/water');
        return data.logs;
    }

    async getDailyStats(date: string) {
        const { data } = await this.api.get(`/logs/stats/${date}`);
        return data.stats;
    }

    // AI
    async generateDietPlan() {
        const { data } = await this.api.post('/ai/diet-plan');
        return data.plan;
    }

    async generateWorkoutPlan() {
        const { data } = await this.api.post('/ai/workout-plan');
        return data.plan;
    }

    async analyzeMeal(base64Image: string) {
        const { data } = await this.api.post('/ai/analyze-meal', { base64Image });
        return data.result;
    }

    async chat(message: string) {
        const { data } = await this.api.post('/ai/chat', { message });
        return data.response;
    }

    async processVoiceLog(base64Audio: string, mimeType: string) {
        const { data } = await this.api.post('/ai/voice-log', { base64Audio, mimeType });
        return data.result;
    }
}

export const api = new ApiService();
