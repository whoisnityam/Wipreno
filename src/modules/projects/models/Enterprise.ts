import { FileFields, FileData } from './FileData';

export interface Enterprise {
    id: string;
    name: string;
    image?: FileData;
    is_deleted: boolean;
}

export const EnterpriseFields = [
    'id',
    'name',
    ...FileFields.map((field) => `image.${field}`),
    'is_deleted'
];
