import { User, UserFields } from '../../profile/models/User';
import { Enterprise } from './Enterprise';
import { ProjectStatus, StatusFields } from './ProjectStatus';
import { Notice, NoticeField } from './Notice';

export interface Project {
    id: string;
    name: string;
    manager_id: User;
    client_id: User | null;
    enterprise_id: Enterprise;
    status_id: ProjectStatus;
    priority: string;
    address: string;
    postal_code: string;
    city: string;
    description: string;
    budget: number;
    start_date: Date;
    notices?: Notice[];
}

export const ProjectFields = [
    'id',
    'name',
    'priority',
    'address',
    'postal_code',
    'city',
    'description',
    'budget',
    'start_date',
    'is_deleted',
    ...UserFields.map((field) => `manager_id.${field}`),
    ...UserFields.map((field) => `client_id.${field}`),
    ...StatusFields.map((field) => `status_id.${field}`),
    ...NoticeField.map((field) => `notices.${field}`)
];

export const ArtisanProjectFields = [
    'id',
    'name',
    'city',
    'status_id.name',
    'manager_id.first_name',
    'manager_id.last_name',
    'client_id.first_name',
    'client_id.last_name',
    'notices.lots.start_date',
    'notices.lots.end_date'
];
