import { APP_BASE_URL } from '../../../services/ApiService';
import { User } from '../../profile/models/User';
import {
    AcceptInvite,
    Auth,
    AuthRequest,
    CreateUser,
    MailEndpoint,
    SendMail,
    UpdateUser
} from '../../../services/DirectusService';

export const login = async (email: string, password: string): Promise<void> => {
    return AuthRequest(Auth.LOGIN, {
        email,
        password
    }).then((response) => {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
    });
};

export const sendConfirmationEmail = async (email: string, userId: string): Promise<void> => {
    return SendMail(MailEndpoint.CONFIRM_EMAIL, {
        email,
        confirmEmailLink: APP_BASE_URL + '/auth/register?id=' + userId + '&successOpen=true'
    });
};

export const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<User> => {
    const user = await CreateUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        is_enterprise_owner: true,
        role: 'eee96d2c-7c72-4e71-95a0-2a05cd6fca9d'
    });
    await sendConfirmationEmail(email, user.id);
    return user;
};

export const confirmEmail = async (id: string): Promise<User> => {
    return UpdateUser(id, { email_verified: true });
};

export const refreshToken = async (): Promise<void> => {
    return AuthRequest(Auth.REFRESH, {
        refresh_token: localStorage.getItem('refresh_token')
    }).then((response) => {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
        window.location.reload();
    });
};

export const forgotPassword = async (email: string): Promise<void> => {
    await AuthRequest(Auth.FORGOT_PASSWORD, {
        email,
        reset_url: APP_BASE_URL + '/auth/reset-password'
    });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
    await AuthRequest(Auth.RESET_PASSWORD, {
        token,
        password
    });
};

export const logout = (): void => {
    AuthRequest(Auth.LOGOUT);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const hasUserData = (): boolean => {
    return (
        Boolean(localStorage.getItem('access_token')) ||
        Boolean(localStorage.getItem('refresh_token'))
    );
};

export const setPassword = async (token: string, password: string): Promise<void> => {
    return AcceptInvite({
        token,
        password
    });
};
