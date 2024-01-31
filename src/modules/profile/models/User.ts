import { Artisan, ArtisanFields } from '../../artisans/models/Artisan';
import { ArtisanProfession } from '../../artisans/models/ArtisanProfession';
import { SubscriptionPlan } from '../../onboarding/models/SubscriptionPlan';
import { Enterprise, EnterpriseFields } from '../../projects/models/Enterprise';
import { ProjectAccessFields } from '../../projects/models/ProjectAccess';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    postal_code: string;
    status: string;
    phone: string;
    city: string;
    manager_profession: string;
    client_status: string;
    company_name: string;
    role: { name: string };
    enterprises: { id?: string; enterprise_id: Enterprise }[];
    email_verified: boolean;
    stripe_bill_amount: number;
    subscription_plan_id: SubscriptionPlan;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    is_enterprise_owner: boolean;
    created_at: Date;
    artisan_id: Artisan;
    artisan_profession: ArtisanProfession[];
    avatarColor?: string;
    avatarBackground?: string;
}

export const UserFields = [
    'id',
    'first_name',
    'last_name',
    'email',
    'address',
    'postal_code',
    'status',
    'phone',
    'city',
    'manager_profession',
    'client_status',
    'company_name',
    'role.name',
    'enterprises.id',
    ...EnterpriseFields.map((field) => `enterprises.enterprise_id.${field}`),
    'email_verified',
    'stripe_bill_amount',
    'subscription_plan_id.*',
    'stripe_subscription_id',
    'stripe_customer_id',
    'is_enterprise_owner',
    'created_at',
    ...ArtisanFields.map((field) => `artisan_id.${field}`),
    'artisan_profession.id',
    'artisan_profession.profession',
    ...ProjectAccessFields.map((field) => `projects.${field}`),
    'artisan_id.id',
    ...EnterpriseFields.map((field) => `artisan_id.created_by.enterprises.enterprise_id.${field}`)
];

export const DiscussionUserFields = [
    'id',
    'first_name',
    'last_name',
    'role.name',
    'enterprises.id'
];

export interface UserContextProps {
    user?: User;
    refreshData: Function;
}

export interface UserViewDataForReport {
    company_name: string;
    email: string;
    phone: string;
}
