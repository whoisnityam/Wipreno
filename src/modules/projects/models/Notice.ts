import { User } from '../../profile/models/User';
import { Project } from './Project';
import { Lot, LotFields } from './Lot';

export interface Notice {
    id: string;
    title: string;
    project_id: Project;
    is_predefined: Boolean;
    created_at?: Date;
    created_by?: User;
    modified_at?: Date;
    modified_by?: User;
    is_deleted: Boolean;
    lots?: Lot[];
}
export const NoticeField = [
    'id',
    'title',
    'project_id',
    'is_predefined',
    'is_deleted',
    ...LotFields.map((field) => `lots.${field}`)
];

export interface PredefinedNotice {
    id: string;
    title: string;
    is_predefined: Boolean;
}
