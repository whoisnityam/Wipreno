import { Lot } from './Lot';
import { Project } from './Project';
import { Slot } from './Slot';
import { User } from '../../profile/models/User';

export interface Consultation {
    id: string;
    lot_id: Lot;
    artisian_id: User;
    description: string;
    project_id: Project;
    selected_slot: Slot;
    selected_slot_time: string;
    has_response: boolean;
    has_received_estimate: boolean;
    has_visited: boolean;
    documents: {
        id: string;
        file: string;
    }[];
    slots: Slot[];
}

export const ConsultationFields = [
    'id',
    'description',
    'lot_id.id',
    'lot_id.title',
    'project_id.id',
    'project_id.name',
    'project_id.start_date',
    'project_id.manager_id.phone',
    'artisian_id.id',
    'project_id.manager_id.first_name',
    'project_id.manager_id.last_name',
    'project_id.manager_id.email',
    'project_id.manager_id.postal_code',
    'project_id.manager_id.address',
    'project_id.manager_id.city',
    'project_id.manager_id.enterprises.enterprise_id.id',
    'project_id.manager_id.enterprises.enterprise_id.image.id',
    'project_id.client_id.first_name',
    'project_id.client_id.last_name',
    'project_id.address',
    'selected_slot.*',
    'selected_slot_time',
    'has_response',
    'has_received_estimate',
    'has_visited',
    'documents.*',
    'slots.*'
];
