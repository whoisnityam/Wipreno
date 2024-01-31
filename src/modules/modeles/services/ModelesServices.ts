import { Notice, PredefinedNotice } from '../../projects/models/Notice';
import { ObjectRequest } from '../../../services/ApiService';
import { Lot } from '../../projects/models/Lot';
import { DependentTaskData } from '../models/DependentTaskData';
import {
    CreateItem,
    GetItemById,
    GetItems,
    Table,
    UpdateItem
} from '../../../services/DirectusService';
import { Role } from '../../profile/models/Role';
import { getLots } from '../../projects/services/LotService';

export const getAdminPredefinedNotices = async (): Promise<Notice[]> => {
    return GetItems<Notice>(
        Table.NOTICE,
        {
            _and: [
                {
                    created_by: {
                        role: {
                            name: { _eq: Role.admin }
                        }
                    }
                },
                {
                    is_predefined: { _eq: true }
                }
            ],
            is_deleted: { _eq: false }
        },
        ['title']
    );
};
export const createAdminPredefinedNotices = async (data: PredefinedNotice): Promise<Notice> => {
    return CreateItem<Notice>(Table.NOTICE, data);
};

export const getMyModels = async (enterpriseId: string): Promise<Notice[]> => {
    return GetItems<Notice>(
        Table.NOTICE,
        {
            _and: [
                {
                    _and: [
                        {
                            created_by: {
                                enterprises: {
                                    enterprise_id: {
                                        id: { _eq: enterpriseId }
                                    }
                                }
                            }
                        },
                        {
                            is_predefined: { _eq: true }
                        }
                    ]
                },
                {
                    _and: [
                        {
                            created_by: {
                                role: {
                                    name: { _eq: Role.projectManager }
                                }
                            }
                        },
                        {
                            is_predefined: { _eq: true }
                        }
                    ]
                }
            ],
            is_deleted: { _eq: false }
        },
        ['title']
    );
};

export const modifyPredefinedNotice = async (id: string, title: string): Promise<Notice> => {
    return UpdateItem<Notice>(Table.NOTICE, id, {
        title
    });
};

export const getNoticeById = async (id: string): Promise<Notice> => {
    return GetItemById<Notice>(Table.NOTICE, id);
};

export const getLotsByNoticeId = async (noticeId: string): Promise<Lot[]> => {
    return getLots(noticeId);
};

export const createNoticeLotsTasks = async (title: string, data: Lot[]): Promise<Notice> => {
    const mutation = `mutation {
        create_notice_item(data: {
                title: "${title}",
                is_predefined: ${true},
                lots: [
                    ${data.map((lot) => {
                        {
                            let planningRes: string[] = [];
                            let estimationRes: string[] = [];
                            if (lot.planning_tasks) {
                                planningRes = lot.planning_tasks.map((task) => {
                                    return `{
                                        title: "${task.title}",
                                        status:"${task.status ?? ''}"
                                        start_date: ${
                                            task.start_date !== null ? `"${task.start_date}"` : null
                                        },
                                        end_date: ${
                                            task.end_date !== null ? `"${task.end_date}"` : null
                                        },
                                    }`;
                                });
                            }
                            if (lot.estimation_tasks) {
                                estimationRes = lot.estimation_tasks.map((task) => {
                                    return `{
                                        title: "${task.title}",
                                        unit: "${task.unit}",
                                        quantity: "${task.quantity}",
                                        unit_price: "${task.unit_price}",
                                        tax: "${task.tax}",
                                        priority: ${task.priority},
                                        materials: ${task.materials},
                                    }`;
                                });
                            }
                            return `{
                                title: "${lot.title}",
                                lot_color: "${lot.lot_color}",
                                start_date: ${
                                    lot.start_date !== null ? `"${lot.start_date}"` : null
                                },
                                tax: "${lot.tax}",
                                end_date: ${lot.end_date !== null ? `"${lot.end_date}"` : null},
                                priority: ${lot.priority},
                                estimation_tasks: [${estimationRes}],
                                planning_tasks: [${planningRes}]
                            }`;
                        }
                    })}
                ]
            }
        ){
            title,
            created_by{
                id,
                first_name
            },
            id,
            lots {
                title,
                lot_color,
                start_date,
                end_date,
                priority,
                tax,
                estimation_tasks {
                    id,
                    title,
                    unit,
                    quantity,
                    unit_price,
                    tax,
                    priority,
                    materials
                },
                planning_tasks {
                    id,
                    title,
                    start_date,
                    end_date
                }
            }
        }
    }`;

    return ObjectRequest<Notice>(mutation, 'create_notice_item');
};

export const createDependentTasks = async (
    dependentTaskDataArray: DependentTaskData[]
): Promise<void> => {
    const data = dependentTaskDataArray.map((dependentTaskData) => {
        return {
            task_id: dependentTaskData.taskId,
            dependent_task_id: dependentTaskData.mainTaskId
        };
    });
    await CreateItem<void>(Table.DEPENDENT_TASK, data);
};
