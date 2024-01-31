export interface PlanningViewData {
    id: string;
    title: string;
    color: string;
    start_date: string;
    end_date: string;
    priority: number;
    tasks: TaskViewData[];
    companyName?: string;
}

export interface TaskViewData {
    id: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    color: string;
    status: string | undefined;
    dependentTasks: {
        id: string;
        task_id: string;
    }[];
}
