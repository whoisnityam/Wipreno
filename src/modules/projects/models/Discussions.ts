import { User } from '../../profile/models/User';
import { DiscussionGroup } from './DiscussionGroup';
import { DocumentFile, DocumentFileFields } from './DocumentFile';

export interface Discussions {
    id: string;
    message?: string;
    discussion_group_id: DiscussionGroup | string;
    created_at: Date;
    created_by?: User;
    file_id?: DocumentFile;
}

export const DiscussionsFields = [
    'id',
    'message',
    'discussion_group_id',
    ...DocumentFileFields.map((field) => `document_file.${field}`),
    'created_at',
    'created_by.id',
    'created_by.first_name',
    'created_by.last_name'
];
