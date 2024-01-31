import { SubscriptionPlan } from './SubscriptionPlan';
import { FileData } from '../../projects/models/FileData';

export interface OnboardingForm {
    enterpriseName: string;
    phoneNumber: string;
    profession: string;
    selectedPlan?: SubscriptionPlan;
    companyName: string;
    postalCode: string;
    address: string;
    city: string;
    logo: FileData | null;
    logoFile: File | null;
}
