import { API } from '../../../services/ApiService';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UpdateUser } from '../models/updateUser';
import { Enterprise } from '../../projects/models/Enterprise';
import { FileData } from '../../projects/models/FileData';
import {
    DeleteUser,
    GetUsers,
    Table,
    UpdateCurrentUser,
    UpdateItem
} from '../../../services/DirectusService';

export const getProjectManagersByEnterpriseId = async (id: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.projectManager }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: id }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['first_name']
    );
};

export const getClientsByEnterpriseId = async (id: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.client }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: id }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['first_name']
    );
};

export const updateUsersData = async (data: UpdateUser): Promise<User> => {
    return UpdateCurrentUser({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
        address: data.address,
        manager_profession: data.profession,
        city: data.city,
        postal_code: parseInt(data.postalCode)
    });
};

export const updateEnterpriseData = async (
    enterpriseId: string,
    name: string,
    image: FileData | null
): Promise<Enterprise> => {
    return UpdateItem<Enterprise>(Table.ENTERPRISE, enterpriseId, {
        name,
        image
    });
};

export const updatePassword = async (userId: string, password: string): Promise<User | null> => {
    return UpdateCurrentUser({
        password
    });
};

export const deleteAccount = async (user: User): Promise<void> => {
    const response = await DeleteUser(user.id);
    if (user.is_enterprise_owner && user.enterprises?.at(0)?.enterprise_id) {
        await UpdateItem<Enterprise>(Table.ENTERPRISE, user.enterprises.at(0)!.enterprise_id.id, {
            is_deleted: true
        });
    }
    await API.post('/stripe/cancel-subscription', {
        subscriptionId: user.stripe_subscription_id
    });
    return response;
};
