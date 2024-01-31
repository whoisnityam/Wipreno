import { Project } from './Project';

export interface Profitability {
    id: string;
    fees: number;
    hourly_cost: number;
    time_spent: number;
    travel_cost: number;
    number_of_trips: number;
    project_id: Project | string;
    is_deleted?: Boolean;
}
