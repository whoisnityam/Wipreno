import { Consultation } from './Consultation';

export interface Slot {
    id: string;
    visit_date: string;
    start_time: string;
    end_time: string;
    consultation_id: Consultation;
}
