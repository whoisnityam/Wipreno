import { Consultation, ConsultationFields } from '../models/Consultation';
import { API } from '../../../services/ApiService';
import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { AddConsultation } from '../models/AddConsultation';
import { Slot } from '../models/Slot';
import {
    CreateItem,
    GetItemById,
    GetItems,
    GetUsers,
    Table,
    UpdateItem
} from '../../../services/DirectusService';
import { FileData } from '../models/FileData';

export const getConsultations = async (projectId: string): Promise<Consultation[]> => {
    return GetItems<Consultation>(
        Table.CONSULTATION,
        {
            project_id: {
                id: { _eq: projectId }
            },
            is_deleted: { _eq: false }
        },
        ['lot_id.title']
    );
};

export const getConsultation = async (id: string): Promise<Consultation> => {
    return GetItemById<Consultation>(
        Table.CONSULTATION,
        id,
        undefined,
        {
            slots: {
                _sort: ['created_at']
            }
        },
        ConsultationFields
    );
};

export const getArtisansByEnterpriseId = async (id: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.artisan }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: id }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['first_name']
    );
};

export const modifyConsultation = async (
    id: string,
    hasResponse: boolean,
    hasVisited: boolean,
    hasReceivedEstimate?: boolean
): Promise<Consultation> => {
    let data: object = {
        has_response: hasResponse,
        has_visited: hasVisited
    };

    if (hasReceivedEstimate !== undefined) {
        data = { ...data, has_received_estimate: hasReceivedEstimate };
    }

    return UpdateItem<Consultation>(Table.CONSULTATION, id, data);
};

export const addConsultation = async (
    data: AddConsultation,
    userId: string
): Promise<Consultation> => {
    return CreateItem<Consultation>(Table.CONSULTATION, {
        lot_id: data.lot_id,
        artisian_id: data.artisian_id,
        description: data.description,
        project_id: data.project_id,
        created_by: userId,
        modified_by: userId
    });
};

export const addConsultationDocument = async (
    file: FileData,
    consultationId: string
): Promise<{ id: string; file: FileData; consultation_id: string }> => {
    return CreateItem<{ id: string; file: FileData; consultation_id: string }>(
        Table.CONSULTATION_DOCUMENT,
        {
            file,
            consultation_id: consultationId
        }
    );
};

export const addConsultationSlot = async (slot: Slot, consultationId: string): Promise<Slot> => {
    return CreateItem<Slot>(Table.SLOT, {
        visit_date: slot.visit_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        consultation_id: consultationId
    });
};

export const sendConsultationEmail = async (
    email: string,
    subject: string,
    projectName: string,
    companyName: string,
    lotsData: {
        lotName: string;
        link: string;
    }[]
): Promise<void> => {
    return API.post('mail/consultation-mail', {
        email,
        subject,
        projectName,
        companyName,
        lotsData
    });
};

export const sendManagerConsultationEmail = async (
    email: string,
    slotData: {
        [visitDate: string]: {
            slotStart: string;
            slotEnd: string;
        }[];
    },
    subject: string,
    details: {
        [lotName: string]: string[];
    }
): Promise<void> => {
    return API.post('mail/manager-consultation-mail', {
        email,
        slotData,
        subject,
        details
    });
};

export const resendConsultationEmail = async (
    email: string,
    consultationLink: string,
    subject: string,
    projectName: string,
    companyName: string
): Promise<void> => {
    return API.post('mail/resend-consultation-mail', {
        email,
        consultationLink,
        subject,
        projectName,
        companyName
    });
};

export const selectConsultationSlot = async (
    id: string,
    slotId: string,
    slotTime: string
): Promise<Consultation> => {
    return UpdateItem<Consultation>(Table.CONSULTATION, id, {
        selected_slot: slotId,
        selected_slot_time: slotTime
    });
};
