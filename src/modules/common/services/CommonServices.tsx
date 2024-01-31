import { GetItems, Table } from '../../../services/DirectusService';
import { ProjectAccess, ProjectAccessFields } from '../../projects/models/ProjectAccess';

export const getAccessProjectsByuserId = async (id: string): Promise<ProjectAccess[]> => {
    return GetItems<ProjectAccess>(
        Table.PROJECT_ACCESS,
        {
            is_deleted: { _eq: false },
            user_id: {
                id: { _eq: id }
            }
        },
        ['-created_at'],
        {},
        ProjectAccessFields
    );
};
