import axios from 'axios';
import { ErrorCode } from '../modules/error/models/ErrorCode';
import { hasUserData, logout, refreshToken } from '../modules/auth/services/AuthService';
import axiosRetry from 'axios-retry';

export const BASE_URL = process.env.REACT_APP_API_URL;
export const GRAPHQL_SYSTEM_ENDPOINT = `${BASE_URL}/graphql/system`;
export const GRAPHQL_ENDPOINT = `${BASE_URL}/graphql`;

export const API = axios.create({
    withCredentials: true,
    baseURL: BASE_URL
});

export const APP_BASE_URL = window.location.origin;

axiosRetry(API, {
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    },
    retryCondition: async (error) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorCode = (error.response as { data: any })?.data.errors[0].extensions.code;
        if (!errorCode) {
            return false;
        }
        switch (errorCode) {
            case ErrorCode.TOKEN_EXPIRED:
                await refreshToken();
                return true;
            default:
                return false;
        }
    }
});

API.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        if (hasUserData()) {
            if (
                config.url === 'auth/login' ||
                config.url === 'auth/refresh' ||
                config.url === 'auth/password/request' ||
                config.url === 'auth/password/reset'
            ) {
                logout();
            } else {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                };
            }
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export async function ListRequest<Type>(
    query: string,
    field: string,
    isSystem?: boolean
): Promise<Type[]> {
    return API.post(isSystem ? GRAPHQL_SYSTEM_ENDPOINT : GRAPHQL_ENDPOINT, { query }).then(
        (response) => {
            return response.data.data[field];
        }
    );
}

export async function ObjectRequest<Type>(
    query: string,
    field: string,
    isSystem?: boolean
): Promise<Type> {
    return API.post(isSystem ? GRAPHQL_SYSTEM_ENDPOINT : GRAPHQL_ENDPOINT, { query }).then(
        (response) => {
            return response.data.data[field];
        }
    );
}
