import { DiscussionUserFields, User } from '../../profile/models/User';
import { Discussions, DiscussionsFields } from './Discussions';

export interface Participants {
    name: string;
    avatarBackground: string;
    avatarColor: string;
}

export interface DiscussionGroup {
    id: string;
    title: string;
    project_id: string;
    created_at?: Date;
    users: { id: string; user_id: User; avatarColor?: string; avatarBackground?: string }[];
    discussions: Discussions[];
    is_deleted: boolean;
}

export const DiscussionGroupFields = [
    'id',
    'title',
    'project_id.id',
    'created_at',
    'created_by.id',
    'created_by.first_name',
    'created_by.last_name',
    'is_deleted',
    'users.id',
    ...DiscussionsFields.map((field) => `discussions.${field}`),
    ...DiscussionUserFields.map((field) => `users.user_id.${field}`)
];
