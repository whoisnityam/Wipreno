import { ObjectRequest } from '../../../services/ApiService';
import {
    CreateItem,
    CreateItems,
    GetItemById,
    GetItems,
    Table,
    UpdateItem
} from '../../../services/DirectusService';
import {
    EstimationTask,
    EstimationTaskFields,
    PlanningTask,
    PlanningTaskFields
} from '../models/Task';

export const getTasks = async (lotId: string): Promise<EstimationTask[]> => {
    return GetItems<EstimationTask>(
        Table.ESTIMATIONTASK,
        {
            lot_id: {
                id: {
                    _eq: lotId
                }
            },
            is_deleted: { _eq: false }
        },
        ['priority']
    );
};

export const deleteTask = async (id: string): Promise<EstimationTask> => {
    return UpdateItem<EstimationTask>(Table.ESTIMATIONTASK, id, {
        is_deleted: true
    });
};

export const deletePlanningTask = async (id: string): Promise<EstimationTask> => {
    return UpdateItem<EstimationTask>(Table.PLANNINGTASK, id, {
        is_deleted: true
    });
};

export const updateTaskOrder = async (taskList: string[]): Promise<void> => {
    const requests = taskList.map(async (id, index) => {
        await UpdateItem<EstimationTask>(Table.ESTIMATIONTASK, id, {
            priority: index + 1
        });
    });
    await Promise.all(requests);
};

export const updateTask = async (task: EstimationTask): Promise<EstimationTask> => {
    return UpdateItem<EstimationTask>(Table.ESTIMATIONTASK, task.id, {
        tax: task.tax,
        unit: task.unit,
        title: task.title,
        quantity: task.quantity,
        materials: task.materials,
        unit_price: task.unit_price
    });
};

export const createTask = async (task: EstimationTask): Promise<EstimationTask> => {
    return CreateItem<EstimationTask>(Table.ESTIMATIONTASK, task);
};

export const createPlanningTask = async (task: object): Promise<PlanningTask> => {
    return CreateItem<PlanningTask>(Table.PLANNINGTASK, task);
};

export const addDateToTask = async (
    id: string,
    title: string,
    startDate: Date,
    endDate: Date
): Promise<PlanningTask> => {
    return UpdateItem<PlanningTask>(Table.PLANNINGTASK, id, {
        title,
        start_date: startDate,
        end_date: endDate
    });
};

export const updatePlanningTaskStatus = async (
    id: string,
    status: string
): Promise<PlanningTask> => {
    return UpdateItem<PlanningTask>(
        Table.PLANNINGTASK,
        id,
        {
            status
        },
        PlanningTaskFields
    );
};

export const removeAllLink = async (links: string[]): Promise<void> => {
    const data = links.map((link) => {
        return `"${link}"`;
    });
    const mutation = `mutation {
	delete_dependent_task_items(ids: [${data}]) {
		ids
	}
}`;
    await ObjectRequest<void>(mutation, 'delete_dependent_task_items');
};

export const linkTasks = async (
    selectedTask: string,
    links: string[],
    dependents: string[]
): Promise<{ id: string; task_id: string; dependent_task_id: string }[]> => {
    if (dependents.length > 0) {
        await removeAllLink(dependents);
    }
    const data = links.map((link) => {
        return {
            task_id: selectedTask,
            dependent_task_id: link
        };
    });
    return CreateItems<{ id: string; task_id: string; dependent_task_id: string }>(
        Table.DEPENDENT_TASK,
        data
    );
};

export const getTaskById = async (id: string): Promise<EstimationTask> => {
    return GetItemById<EstimationTask>(
        Table.ESTIMATIONTASK,
        id,
        { is_deleted: { _eq: false } },
        undefined,
        EstimationTaskFields
    );
};

export const updateTaskDate = async (
    id: string,
    startDate: Date,
    endDate: Date
): Promise<PlanningTask> => {
    return UpdateItem<PlanningTask>(Table.PLANNINGTASK, id, {
        start_date: startDate,
        end_date: endDate
    });
};
