import { User } from '../../profile/models/User';
import { FileFields, FileData } from '../../projects/models/FileData';

export interface Artisan {
    id: string;
    department: string;
    remark: string;
    rib: FileData;
    decennial_insurance: FileData;
    created_at: Date;
    created_by: User;
    modified_at: Date;
    modified_by: User;
}

export const ArtisanFields = [
    'id',
    'department',
    'remark',
    ...FileFields.map((field) => `rib.${field}`),
    ...FileFields.map((field) => `decennial_insurance.${field}`)
];
