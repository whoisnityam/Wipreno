import { User } from '../../profile/models/User';
import { DocumentFolder } from './DocumentFolder';
import { FileData } from './FileData';

export interface DocumentFile {
    id: string;
    file_id: FileData;
    type?: string;
    title?: string;
    folder_id: DocumentFolder;
    created_at?: Date;
    created_by?: User;
    modified_at?: Date;
    modified_by?: User;
    is_deleted: Boolean;
}
export const DocumentFileFields = [
    'id',
    'file_id.*',
    'folder_id.id',
    'created_at',
    'created_by.last_name',
    'created_by.first_name',
    'is_deleted'
];
