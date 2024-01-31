interface UpdatedState {
    saveButton?: boolean;
}

export interface EstimationTask extends UpdatedState {
    id: string;
    title: string;
    unit: string;
    quantity: number | undefined;
    unit_price: number | undefined;
    tax: number;
    materials: boolean;
    priority: number;
    lot_id?: string;
    is_deleted?: Boolean;
}

export interface PlanningTask {
    id: string;
    title: string;
    status?: string;
    lot_id?: string;
    start_date: string | null;
    end_date: string | null;
    is_deleted?: Boolean;
    dependencies?: [{ id: string; task_id: { id: string } }];
}

export const EstimationTaskFields = [
    'id',
    'title',
    'unit',
    'quantity',
    'unit_price',
    'tax',
    'materials',
    'priority',
    'lot_id',
    'is_deleted'
];

export const PlanningTaskFields = [
    'id',
    'title',
    'status',
    'start_date',
    'end_date',
    'lot_id',
    'is_deleted',
    'dependencies.id',
    'dependencies.task_id.id'
];
