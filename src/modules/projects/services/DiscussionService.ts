import {
    CreateItem,
    GetItems,
    Table,
    UpdateItem,
    DeleteItem
} from '../../../services/DirectusService';
import { User } from '../../profile/models/User';
import { getProjectManagersByEnterpriseId } from '../../profile/services/ProfileService';
import { DiscussionGroup, DiscussionGroupFields } from '../models/DiscussionGroup';
import { Discussions, DiscussionsFields } from '../models/Discussions';
import { getUserAccessForDiscussion } from './UserAccessService';

export const getDiscussionByGroupId = async (id: string): Promise<Discussions[]> => {
    return GetItems<Discussions>(
        Table.DISCUSSION,
        {
            discussion_group_id: {
                id: {
                    _eq: id
                }
            },
            is_deleted: { _eq: false }
        },
        ['created_at'],
        DiscussionsFields
    );
};

export const createDiscussion = async (
    data: Discussions,
    fileId?: string
): Promise<Discussions> => {
    return CreateItem<Discussions>(Table.DISCUSSION, { ...data, file_id: fileId });
};

export const getDiscussionGroupsByProjectId = async (id: string): Promise<DiscussionGroup[]> => {
    return GetItems<DiscussionGroup>(
        Table.DISCUSSION_GROUP,
        {
            project_id: {
                id: {
                    _eq: id
                }
            },
            users: {
                user_id: '$CURRENT_USER'
            }
        },
        ['created_at'],
        {
            discussions: {
                _sort: ['created_at']
            }
        },
        DiscussionGroupFields
    );
};

export const createDiscussionGroup = async (
    title: string,
    users: string[],
    projectId: string
): Promise<DiscussionGroup> => {
    return CreateItem<DiscussionGroup>(Table.DISCUSSION_GROUP, {
        title,
        users: users.map((item) => {
            return { user_id: item };
        }),
        project_id: projectId
    });
};

export const deleteDiscussionGroup = async (group: DiscussionGroup): Promise<DiscussionGroup> => {
    return UpdateItem<DiscussionGroup>(Table.DISCUSSION_GROUP, group.id, {
        is_deleted: !group.is_deleted
    });
};

export const removeUserFromGroup = async (id: string): Promise<void> => {
    return DeleteItem(Table.USER_DISCUSSIONGROUP, id);
};

const addUserToGroup = async (groupId: string, userId: string): Promise<void> => {
    return CreateItem(Table.USER_DISCUSSIONGROUP, {
        discussion_group_id: groupId,
        user_id: userId
    });
};
export const addUsersToGroup = async (users: string[], groupId: string): Promise<void> => {
    users.map(async (user) => {
        await addUserToGroup(groupId, user);
    });
};

export const getUsersForDiscussion = async (
    projectId: string,
    enterpriseId: string
): Promise<User[]> => {
    const participants = await getProjectManagersByEnterpriseId(enterpriseId);
    const projectUsers = await getUserAccessForDiscussion(projectId);
    const allusers = participants.concat(projectUsers.map((item) => item.user_id));
    allusers.sort((a, b) => (a.first_name.toLowerCase() > b.first_name.toLowerCase() ? 1 : -1));
    return allusers;
};
