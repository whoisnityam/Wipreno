export interface SubscriptionPlan {
    id: string;
    name: string;
    base_price: string;
    features: [{ feature: string; is_available: boolean }];
    price_id: string;
    type: string;
    is_trial: boolean;
    is_pro: boolean;
}
