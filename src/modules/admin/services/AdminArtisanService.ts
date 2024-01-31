import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { GetItems, GetUsers, Table } from '../../../services/DirectusService';

export const getAllArtisans = async (): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: {
                    _eq: Role.artisan
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['-created_at']
    );
};

export const getProjectsByArtisanId = async (artisanId: string): Promise<Project[]> => {
    return GetItems<Project>(
        Table.PROJECT,
        {
            status_id: {
                name: {
                    _nin: ['Chantier terminé', 'Chantier perdu']
                }
            },
            is_deleted: { _eq: false },
            notices: {
                lots: {
                    artisan_id: {
                        id: { _eq: artisanId }
                    }
                }
            }
        },
        ['-created_at', 'name']
    );
};
