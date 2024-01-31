import { API, APP_BASE_URL, ListRequest } from '../../../services/ApiService';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { OnboardingForm } from '../models/OnboardingForm';
import { ProjectStatus } from '../../projects/models/ProjectStatus';
import { CreateItem, Table, UpdateCurrentUser } from '../../../services/DirectusService';
import { Enterprise } from '../../projects/models/Enterprise';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    const query = `{
        subscription_plan(sort: ["display_order"]) {
            id,
            base_price,
            features,
            name,
            type,
            price_id,
            is_trial,
            is_pro
        }
    }
  `;

    return ListRequest<SubscriptionPlan>(query, 'subscription_plan');
};

export const getPredefinedStatus = async (): Promise<ProjectStatus[]> => {
    const response = await API.get('items/project_status', {
        params: {
            filter: { enterprise_id: { _null: true } }
        }
    });
    return response.data.data;
};

export const saveStatus = async (id: string): Promise<void> => {
    const predefined = await getPredefinedStatus();
    await API.post(
        '/items/project_status',
        predefined.map((item) => {
            return {
                name: item.name,
                is_default_status: item.is_default_status,
                priority: item.priority,
                enterprise_id: id
            };
        })
    );
};

export const saveOnboardingData = async (data: OnboardingForm): Promise<void> => {
    const enterprise = await CreateItem<Enterprise>(Table.ENTERPRISE, {
        name: data.enterpriseName,
        image: data.logo?.id
    });
    const user = await UpdateCurrentUser({
        phone: data.phoneNumber,
        postal_code: parseInt(data.postalCode),
        address: data.address,
        city: data.city,
        manager_profession: data.profession,
        company_name: data.companyName
    });
    await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
        Table.USER_ENTERPRISE,
        { user_id: user.id, enterprise_id: enterprise.id }
    );
    await saveStatus(enterprise.id);
};

export const redirectToCheckout = async (
    priceId: string,
    email: string,
    userId: string,
    isTrial: boolean,
    address: string,
    postalCode: string,
    city: string
): Promise<string> => {
    const session = await API.post('/stripe/create-checkout-session', {
        email,
        priceId,
        domain: APP_BASE_URL,
        userId,
        isTrial,
        address,
        postalCode,
        city
    });
    return session.data;
};
