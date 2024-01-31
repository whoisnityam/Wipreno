import { User } from '../../profile/models/User';
import { ProjectStatus } from './ProjectStatus';

export interface ProjectFormData {
    name: string;
    projectManager: User | undefined;
    client: User | null | undefined;
    priority: string;
    progressStatus: ProjectStatus | undefined;
    description: string;
    clientLastName: string;
    clientFirstName: string;
    email: string;
    phoneNumber: string;
    status: string;
    enterprise: string;
    address: string;
    postalCode: string;
    city: string;
    budget: string;
    startOfWork: Date | undefined;
}
