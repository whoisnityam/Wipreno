import { FileData } from '../../projects/models/FileData';

export interface UpdateUser {
    id: string;
    lastName: string;
    firstName: string;
    emailFieldLabel: string;
    phoneNumber: string;
    enterprise: string;
    address: string;
    newPassword: string;
    confirmPassword: string;
    postalCode: string;
    profession: string;
    city: string;
    enterpriseImage: FileData | null;
}
