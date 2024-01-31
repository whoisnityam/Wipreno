import { Project } from './Project';

export interface Budget {
    id: string;
    project_id: Project;
    value_type: string;
    entitled: string;
    unit_price: number;
    unit_price_with_tax: number;
    is_deleted: Boolean;
}

export const BudgetFields = [
    'id',
    'project_id',
    'value_type',
    'entitled',
    'unit_price',
    'unit_price_with_tax',
    'is_deleted'
];

export interface BudgetInterface {
    id: string;
    project_id: string;
    lot_id: string;
    value_type: string;
    entitled: string;
    unit_price: number;
    unit_price_with_tax: number;
    is_deleted: boolean;
}
