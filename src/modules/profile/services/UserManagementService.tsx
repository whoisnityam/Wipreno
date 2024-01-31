import { API, APP_BASE_URL } from '../../../services/ApiService';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { getUserCount, updateSubscription } from './SubscriptionService';
import {
    CreateItem,
    DeleteUser,
    GetUserByEmail,
    GetUsers,
    Table,
    UpdateUser
} from '../../../services/DirectusService';

export const getUsers = async (enterpriseId: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.projectManager }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: enterpriseId }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['-created_at']
    );
};

export const getUserByEnterpriseOwner = async (enterpriseId: string): Promise<User | undefined> => {
    const users = await GetUsers(
        {
            role: {
                name: { _eq: Role.projectManager }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: enterpriseId }
                }
            },
            is_enterprise_owner: { _eq: true }
        },
        [],
        1
    );
    return users.at(0);
};

const updateUserInfo = async (
    lastName: string,
    firstName: string,
    email: string,
    enterpriseId: string,
    status: string
): Promise<User | undefined> => {
    let user = await GetUserByEmail(email);
    if (user) {
        user = await UpdateUser(user.id, {
            email,
            first_name: firstName,
            last_name: lastName,
            status
        });
        await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
            Table.USER_ENTERPRISE,
            { user_id: user.id, enterprise_id: enterpriseId }
        );
        const owner = await getUserByEnterpriseOwner(enterpriseId);
        const userCount = await getUserCount(enterpriseId);
        if (owner) {
            await updateSubscription(
                owner.stripe_customer_id,
                owner.stripe_subscription_id,
                owner.subscription_plan_id.price_id,
                userCount
            );
        }
    }
    return user;
};

export const createUser = async (
    lastName: string,
    firstName: string,
    email: string,
    enterpriseId: string
): Promise<User | undefined> => {
    return API.post('/users/invite', {
        email,
        role: 'eee96d2c-7c72-4e71-95a0-2a05cd6fca9d',
        invite_url: APP_BASE_URL + '/auth/set-password'
    })
        .then(() => {
            return updateUserInfo(lastName, firstName, email, enterpriseId, 'invited');
        })
        .catch(async (errors) => {
            const err = errors.response.data.errors[0].extensions.code;
            if (err === 'RECORD_NOT_UNIQUE') {
                return updateUserInfo(lastName, firstName, email, enterpriseId, 'active');
            } else {
                throw errors;
            }
        });
};

export const updateUser = async (
    nameOfTheContact: string,
    contactFirstName: string,
    id: string
): Promise<User> => {
    return UpdateUser(id, {
        first_name: contactFirstName,
        last_name: nameOfTheContact
    });
};

export const deleteUser = async (id: string, enterpriseId: string): Promise<void | User> => {
    const user = await DeleteUser(id);
    const owner = await getUserByEnterpriseOwner(enterpriseId);
    const userCount = await getUserCount(enterpriseId);
    if (owner) {
        await updateSubscription(
            owner.stripe_customer_id,
            owner.stripe_subscription_id,
            owner.subscription_plan_id.price_id,
            userCount
        );
    }
    return user;
};
