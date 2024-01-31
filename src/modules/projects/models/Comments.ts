import { User } from '../../profile/models/User';
import { Project } from './Project';

export interface Comments {
    id: string;
    comment: string;
    project_id: Project | string;
    created_at: Date;
    created_by?: User;
}

export const CommentFields = [
    'id',
    'comment',
    'project_id',
    'created_at',
    'created_by.id',
    'created_by.first_name',
    'created_by.last_name'
];
