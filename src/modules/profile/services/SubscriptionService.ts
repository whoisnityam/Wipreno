import { Role } from '../models/Role';
import { API, APP_BASE_URL } from '../../../services/ApiService';
import { User } from '../models/User';
import { GetUsers, UpdateCurrentUser } from '../../../services/DirectusService';

export const getUserCount = async (enterpriseId: string): Promise<number> => {
    const users = await GetUsers({
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
    });
    return users.length;
};

export const getInvoices = async (
    customerId: string
): Promise<{ date: string; priceId: string; amount: number; invoicePdf: string }[]> => {
    const response = await API.post('/stripe/get-invoices', { customerId });
    return response.data;
};

export const updateAddress = async (
    companyName: string,
    address: string,
    city: string,
    postalCode: string,
    customerId: string
): Promise<User> => {
    const user = await UpdateCurrentUser({
        company_name: companyName,
        address,
        city,
        postal_code: postalCode
    });
    await API.post(`/stripe/update-customer`, {
        customerId,
        address,
        city,
        postalCode
    });
    return user;
};

export const updateSubscription = async (
    customerId: string,
    subscriptionId: string,
    priceId: string,
    quantity: number
): Promise<{ redirect: string } | void> => {
    const response = await API.post('stripe/update-subscription', {
        customerId,
        subscriptionId,
        priceId,
        quantity,
        domain: APP_BASE_URL
    });
    return response.data;
};
