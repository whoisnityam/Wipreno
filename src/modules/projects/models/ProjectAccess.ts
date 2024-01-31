import { User } from '../../profile/models/User';
import { Project } from './Project';

export interface ProjectAccess {
    id: string;
    user_id: User;
    project_id: Project;
    full_access: boolean;
    has_planning: boolean;
    has_reports: boolean;
    has_discussions: boolean;
    has_documents: boolean;
    created_by: User;
    modified_by: User;
    is_deleted: boolean;
}

export const ProjectAccessFields = [
    'id',
    'user_id.id',
    'user_id.first_name',
    'user_id.last_name',
    'user_id.role.name',
    'user_id.email',
    'user_id.enterprises.enterprise_id.id',
    'project_id',
    'project_id.id',
    'project_id.name',
    'project_id.status_id.name',
    'project_id.manager_id.first_name',
    'project_id.manager_id.last_name',
    'full_access',
    'has_planning',
    'has_reports',
    'has_discussions',
    'has_documents',
    'created_by',
    'modified_by',
    'is_deleted'
];
