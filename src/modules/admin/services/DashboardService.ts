import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { GetUsers } from '../../../services/DirectusService';

export const getSubscribedUsers = async (): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.projectManager }
            },
            is_enterprise_owner: { _eq: true },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['-created_at']
    );
};

export const getProjectManagerCountByEnterpriseId = async (
    enterpriseId: string
): Promise<number> => {
    return (
        await GetUsers({
            role: {
                name: { _eq: Role.projectManager }
            },
            enterprises: {
                enterprise_id: {
                    id: {
                        _eq: enterpriseId
                    }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        })
    ).length;
};
