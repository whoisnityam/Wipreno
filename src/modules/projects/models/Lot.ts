import { Notice } from './Notice';
import { Project } from './Project';
import { EstimationTask, EstimationTaskFields, PlanningTask, PlanningTaskFields } from './Task';
import { User, UserFields, UserViewDataForReport } from '../../profile/models/User';
import { Budget, BudgetFields } from './Budget';

export interface Lot {
    id: string;
    title: string;
    notice_id: Notice;
    project_id: Project;
    start_date: string;
    end_date: string;
    lot_color: string;
    artisan_id: User;
    priority: number;
    is_deleted: Boolean;
    planning_tasks?: PlanningTask[];
    estimation_tasks?: EstimationTask[];
    budgets?: Budget[];
    amount_HT?: number;
    amount_TTC?: number;
    tax: number;
}

export const LotFields = [
    'id',
    'title',
    'notice_id',
    'project_id.id',
    'project_id.name',
    'project_id.name',
    'project_id.city',
    'project_id.status_id.name',
    'project_id.client_id.first_name',
    'project_id.client_id.last_name',
    'project_id.manager_id.first_name',
    'project_id.manager_id.last_name',
    'start_date',
    'end_date',
    'lot_color',
    'priority',
    'is_deleted',
    'amount_HT',
    'amount_TTC',
    'tax',
    ...UserFields.map((field) => `artisan_id.${field}`),
    ...PlanningTaskFields.map((field) => `planning_tasks.${field}`),
    ...EstimationTaskFields.map((field) => `estimation_tasks.${field}`),
    ...BudgetFields.map((field) => `budgets.${field}`)
];

export interface LotData {
    totalAmountWithTax: number;
    totalAmountWithoutTax: number;
    tasklistLength: number;
    lotId: string;
}

export interface LotViewDataForReport {
    id: string | null;
    title: string;
    artisan_id: UserViewDataForReport | undefined;
}
