import { FileData } from '../../projects/models/FileData';

export interface ArtisanFormData {
    companyName: string;
    address: string;
    department: string;
    city: string;
    nameOfTheContact: string;
    contactFirstName: string;
    artisanId: string;
    email_id: string;
    phoneNumber: string;
    professionList: string[];
    remark: string;
    rib: FileData | null;
    decennialInsurance: FileData | null;
}
