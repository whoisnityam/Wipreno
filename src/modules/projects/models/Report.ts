import { User } from '../../profile/models/User';
import { Project } from './Project';
import { FileData } from './FileData';

export interface ReportAttachment {
    id: string;
    file: FileData;
    report_item_id: string;
}

export interface ReportItem {
    id: string;
    report_id: string;
    lot_id: string;
    comment: string;
    attachments: ReportAttachment[];
}

export interface Report {
    id: string;
    projectId: Project;
    created_at: Date;
    created_by: User;
    items: ReportItem[];
}

export const ReportFields = [
    'id',
    'project_id',
    'created_at',
    'created_by.first_name',
    'created_by.last_name',
    'items.id',
    'items.lot_id',
    'items.comment',
    'items.attachments.id',
    'items.attachments.file.*'
];
