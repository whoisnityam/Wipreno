import { User } from '../../profile/models/User';
import { DocumentFile, DocumentFileFields } from './DocumentFile';
import { Project } from './Project';

export interface DocumentFolder {
    id: string;
    name: string;
    type: string;
    project_id: Project;
    created_at?: Date;
    created_by?: User;
    modified_at?: Date;
    modified_by?: User;
    is_deleted: Boolean;
    files?: DocumentFile[];
}

export const DocumentFolderFields = [
    'id',
    'name',
    'type',
    'project_id.id',
    'created_at',
    'created_by.first_name',
    'created_by.last_name',
    'is_deleted',
    ...DocumentFileFields.map((field) => `files.${field}`)
];
