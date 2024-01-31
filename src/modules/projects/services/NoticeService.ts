import { ObjectRequest } from '../../../services/ApiService';
import { Lot } from '../models/Lot';
import { Notice } from '../models/Notice';
import { Project } from '../models/Project';
import { GetItems, Table, UpdateItem } from '../../../services/DirectusService';

export const getPredefinedNotices = async (enterpriseId: string): Promise<Notice[]> => {
    return GetItems<Notice>(
        Table.NOTICE,
        {
            _or: [
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
                                    name: { _eq: 'ADMIN' }
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

export const deleteNotice = async (id: string): Promise<Notice> => {
    return UpdateItem<Notice>(Table.NOTICE, id, {
        is_deleted: true
    });
};

export const createNoticeLotsTasks = async (
    title: string,
    data: Lot[],
    projectData: Project
): Promise<Notice> => {
    const mutation = `mutation {
        create_notice_item(data: {
                title: "${title}",
                lots: [
                    ${data.map((lot) => {
                        {
                            let estimationRes: string[] = [];
                            let planningRes: string[] = [];
                            if (
                                (lot.estimation_tasks && lot.estimation_tasks.length > 0) ||
                                (lot.planning_tasks && lot.planning_tasks.length > 0)
                            ) {
                                if (lot.estimation_tasks && lot.estimation_tasks.length > 0) {
                                    estimationRes = lot.estimation_tasks.map((task) => {
                                        return `{
                                        title: "${task.title ?? ''}",
                                        unit: "${task.unit ?? ''}",
                                        quantity: "${task.quantity ?? 0}",
                                        unit_price: "${task.unit_price ?? 0}",
                                        tax: "${task.tax ?? 0}",
                                        priority: ${task.priority ?? 0},
                                        materials: ${task.materials ?? false},
                                    }`;
                                    });
                                }

                                if (lot.planning_tasks && lot.planning_tasks.length > 0) {
                                    planningRes = lot.planning_tasks.map((task) => {
                                        return `{
                                        title: "${task.title ?? ''}",
                                        status: "${task.status ?? ''}"
                                        start_date: ${
                                            task.start_date ? `"${task.start_date}"` : null
                                        },
                                        end_date: ${task.end_date ? `"${task.end_date}"` : null},
                                    }`;
                                    });
                                }
                                return `{
                                    title: "${lot.title ?? ''}",
                                    lot_color: "${lot.lot_color ?? ''}",
                                    start_date: ${lot.start_date ? `"${lot.start_date}"` : null},
                                    end_date: ${lot.end_date ? `"${lot.end_date}"` : null},
                                    priority: ${lot.priority ?? 0},
                                    tax: "${lot.tax}",
                                    estimation_tasks: [${estimationRes}],
                                    planning_tasks: [${planningRes}],
                                    project_id: {
                                       id: "${projectData.id}",
                                       start_date: "${projectData.start_date}"
                                    }
                                }`;
                            } else {
                                return `{
                                    title: "${lot.title ?? ''}",
                                    lot_color: "${lot.lot_color ?? ''}",
                                    priority: ${lot.priority ?? 0},
                                    tax: "${lot.tax}",
                                    estimation_tasks: [],
                                    planning_tasks: [],
                                    project_id: {
                                       id: "${projectData.id}",
                                       start_date: "${projectData.start_date}"
                                    }
                                }`;
                            }
                        }
                    })}
                ]
            }
        ){
            id
        }
    }`;
    return ObjectRequest<Notice>(mutation, 'create_notice_item');
};

export const modifyNotice = async (id: string, projectId: string): Promise<Notice> => {
    return UpdateItem<Notice>(Table.NOTICE, id, {
        project_id: projectId
    });
};
