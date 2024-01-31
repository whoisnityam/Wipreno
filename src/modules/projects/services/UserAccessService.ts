import {
    CreateItem,
    DeleteItem,
    GetItems,
    Table,
    UpdateItem
} from '../../../services/DirectusService';
import { ProjectAccess, ProjectAccessFields } from '../models/ProjectAccess';

export const getUserAccessByProjectId = async (
    projectId: string,
    enterpriseId: string
): Promise<ProjectAccess[]> => {
    return GetItems<ProjectAccess>(
        Table.PROJECT_ACCESS,
        {
            is_deleted: { _eq: false },
            project_id: {
                id: { _eq: projectId }
            },
            user_id: {
                enterprises: {
                    enterprise_id: {
                        id: { _eq: enterpriseId }
                    }
                }
            }
        },
        ['-created_at'],
        {},
        ProjectAccessFields
    );
};

export const getUserAccessForDiscussion = async (projectId: string): Promise<ProjectAccess[]> => {
    return GetItems<ProjectAccess>(
        Table.PROJECT_ACCESS,
        {
            is_deleted: { _eq: false },
            project_id: {
                id: { _eq: projectId }
            },
            _or: [
                {
                    has_discussions: {
                        _eq: true
                    }
                },
                {
                    full_access: {
                        _eq: true
                    }
                }
            ]
        },
        ['user_id.first_name'],
        {},
        ProjectAccessFields
    );
};
export const getUserAccessByUserId = async (userId: string): Promise<ProjectAccess[]> => {
    return GetItems<ProjectAccess>(
        Table.PROJECT_ACCESS,
        {
            is_deleted: { _eq: false },
            user_id: {
                id: { _eq: userId }
            }
        },
        ['-created_at'],
        {},
        ProjectAccessFields
    );
};

export const CreateAccess = async (
    projectId: string,
    userId: string,
    planning: boolean,
    reports: boolean,
    discussion: boolean,
    documents: boolean
): Promise<ProjectAccess> => {
    return CreateItem<ProjectAccess>(Table.PROJECT_ACCESS, {
        project_id: projectId,
        user_id: userId,
        has_planning: planning,
        has_reports: reports,
        has_discussions: discussion,
        has_documents: documents
    });
};

export const ModifyAccess = async (
    id: string,
    planning: boolean,
    reports: boolean,
    discussion: boolean,
    documents: boolean
): Promise<ProjectAccess> => {
    return UpdateItem<ProjectAccess>(Table.PROJECT_ACCESS, id, {
        has_planning: planning,
        has_reports: reports,
        has_discussions: discussion,
        has_documents: documents
    });
};

export const removeAccess = async (id: string): Promise<void> => {
    await DeleteItem(Table.PROJECT_ACCESS, id);
};
