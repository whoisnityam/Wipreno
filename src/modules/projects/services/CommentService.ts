import { Role } from '../../profile/models/Role';
import { Comments } from '../models/Comments';
import { CreateItem, DeleteItem, GetItems, Table } from '../../../services/DirectusService';

export const getCommentsByProjectId = async (id: string): Promise<Comments[]> => {
    return GetItems<Comments>(
        Table.COMMENT,
        {
            project_id: {
                id: {
                    _eq: id
                }
            },
            is_deleted: { _eq: false },
            created_by: {
                role: {
                    name: { _eq: Role.projectManager }
                }
            }
        },
        ['created_at']
    );
};

export const createComment = async (data: Comments): Promise<void> => {
    await CreateItem<Comment>(Table.COMMENT, data);
};

export const deleteCommentsByProjectId = async (id: string): Promise<void> => {
    await DeleteItem(Table.COMMENT, id);
};
