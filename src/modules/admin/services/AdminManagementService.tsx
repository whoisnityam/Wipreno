import { API, APP_BASE_URL } from '../../../services/ApiService';
import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { CreateAdmin } from '../models/CreateAdmin';
import { GetUsers, UpdateUser } from '../../../services/DirectusService';

export const getAdmins = async (): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.admin }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['-created_at']
    );
};

export const getAdminByEmail = async (email: string): Promise<User[]> => {
    return GetUsers({
        role: {
            name: { _eq: Role.admin }
        },
        email: { _eq: email }
    });
};

export const deleteAdmin = async (userId: string): Promise<User> => {
    return UpdateUser(userId, { status: 'archived' });
};

export const modifyAdmin = async (data: CreateAdmin, userId: string): Promise<void | User> => {
    return UpdateUser(userId, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name
    });
};

const updateAdminInfo = async (data: CreateAdmin): Promise<void | User> => {
    const userInfo = await getAdminByEmail(data.email);
    return UpdateUser(userInfo[0].id, {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name
    });
};

export const createAdminInvite = async (data: CreateAdmin): Promise<void | User> => {
    const response = await API.post(`users/invite`, {
        email: data.email,
        role: '0213b951-aca4-47f6-8959-4f2c89cb8d88',
        invite_url: APP_BASE_URL + '/auth/set-password'
    });
    await updateAdminInfo(data);
    return response.data.data;
};
