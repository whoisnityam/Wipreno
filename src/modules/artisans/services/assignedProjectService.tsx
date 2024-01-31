import { ProjectStatus } from '../models/projectStatus';
import { Consultation } from '../../projects/models/Consultation';
import { GetItems, Table } from '../../../services/DirectusService';

export const getProjectStatusColorFor = (priority: string): string => {
    switch (priority) {
        case ProjectStatus.completedProject:
            return '#D9F5C4';
        case ProjectStatus.inProgress:
            return '#F7D9E1';
        case ProjectStatus.lostProject:
            return '#F3C7C6';
        default:
            return '#F3C7C6';
    }
};

export const getProjectStatusTextColor = (priority: string): string => {
    switch (priority) {
        case ProjectStatus.completedProject:
            return '#25480C';
        case ProjectStatus.inProgress:
            return '#6A182F';
        case ProjectStatus.lostProject:
            return '#791A1A';
        default:
            return '#791A1A';
    }
};

export const getConsultationsByArtisanId = async (id: string): Promise<Consultation[]> => {
    return GetItems<Consultation>(Table.CONSULTATION, {
        artisian_id: {
            id: {
                _eq: id
            }
        }
    });
};
