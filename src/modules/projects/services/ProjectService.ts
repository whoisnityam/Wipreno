import { Project } from '../models/Project';
import { ProjectPriority } from '../models/ProjectPriority';
import { convertToDbValue } from '../../../utils';
import {
    CreateItem,
    GetItemById,
    GetItems,
    Table,
    UpdateItem
} from '../../../services/DirectusService';
import { ProjectAccess } from '../models/ProjectAccess';
import { Enterprise } from '../models/Enterprise';
import { User } from '../../profile/models/User';
import { ProjectStatus } from '../models/ProjectStatus';

export const getProjectPriorityColorFor = (priority: string): string => {
    switch (priority) {
        case ProjectPriority.Urgent:
            return '#F3C7C6';
        case ProjectPriority.Moyen:
            return '#F5CBA6';
        case ProjectPriority.Faible:
            return '#D9F5C4';
        default:
            return '#F3C7C6';
    }
};

export const getProjectPriorityTextColor = (priority: string): string => {
    switch (priority) {
        case ProjectPriority.Urgent:
            return '#791A1A';
        case ProjectPriority.Moyen:
            return '#85470F';
        case ProjectPriority.Faible:
            return '#25480C';
        default:
            return '#791A1A';
    }
};

export const getProject = async (id: string): Promise<Project> => {
    return GetItemById<Project>(
        Table.PROJECT,
        id,
        { is_deleted: { _eq: false } },
        {
            notices: {
                lots: {
                    planning_tasks: {
                        _filter: {
                            is_deleted: { _eq: false }
                        }
                    },
                    estimation_tasks: {
                        _filter: {
                            is_deleted: { _eq: false }
                        },
                        _sort: ['priority']
                    }
                },
                _filter: {
                    is_deleted: { _eq: false }
                }
            }
        }
    );
};

export const getArchivedProjects = async (enterpriseId: string): Promise<Project[]> => {
    return GetItems<Project>(Table.PROJECT, {
        enterprise_id: {
            id: {
                _eq: enterpriseId
            }
        },
        status_id: {
            name: {
                _in: ['Chantier terminé', 'Projet perdu']
            }
        },
        is_deleted: { _eq: false }
    });
};

export const getProjects = async (enterpriseId: string): Promise<Project[]> => {
    return GetItems<Project>(
        Table.PROJECT,
        {
            enterprise_id: {
                id: {
                    _eq: enterpriseId
                }
            },
            status_id: {
                name: {
                    _nin: ['Chantier terminé', 'Projet perdu']
                }
            },
            is_deleted: { _eq: false }
        },
        ['-created_at', 'name'],
        {
            notices: {
                lots: {
                    planning_tasks: {
                        _filter: {
                            is_deleted: { _eq: false }
                        }
                    },
                    estimation_tasks: {
                        _filter: {
                            is_deleted: { _eq: false }
                        },
                        _sort: ['priority']
                    }
                },
                _filter: {
                    is_deleted: { _eq: false }
                }
            }
        }
    );
};

export const addProject = async (data: {
    address: string;
    city: string;
    description: string;
    enterprise_id: Enterprise;
    priority: string;
    client_id: User;
    status_id: ProjectStatus;
    manager_id: User;
    name: string;
    id: string;
    postal_code: string;
    budget: number;
    start_date: Date;
}): Promise<Project> => {
    return CreateItem<Project>(Table.PROJECT, {
        enterprise_id: data.enterprise_id.id ?? '',
        manager_id: data.manager_id.id,
        priority: data.priority,
        status_id: data.status_id.id,
        address: data.address,
        postal_code: data.postal_code,
        city: data.city,
        client_id: data.client_id === null ? null : data.client_id.id,
        description: data.description,
        budget: convertToDbValue(data.budget),
        start_date: data.start_date,
        name: data.name
    });
};

export const deleteProject = async (projectId: string): Promise<void | Project> => {
    return UpdateItem<Project>(Table.PROJECT, projectId, {
        is_deleted: true
    });
};

export const updateProject = async (data: {
    address: string;
    city: string;
    description: string;
    enterprise_id: Enterprise;
    priority: string;
    client_id: User;
    status_id: ProjectStatus;
    manager_id: User;
    name: string;
    id: string;
    postal_code: string;
    budget: number;
    start_date: Date;
}): Promise<Project> => {
    return UpdateItem<Project>(Table.PROJECT, data.id, {
        enterprise_id: data.enterprise_id.id ?? '',
        manager_id: data.manager_id.id,
        priority: data.priority,
        status_id: data.status_id.id,
        address: data.address,
        postal_code: data.postal_code,
        city: data.city,
        client_id: data.client_id === null ? null : data.client_id.id,
        description: data.description,
        budget: convertToDbValue(data.budget),
        start_date: data.start_date,
        name: data.name
    });
};

export const updateProjectStatus = async (
    projectId: string,
    statusId: string
): Promise<Project> => {
    return UpdateItem<Project>(Table.PROJECT, projectId, {
        status_id: statusId
    });
};

export const updateProjectStartDate = async (
    projectId: string,
    startDate: Date
): Promise<Project> => {
    return UpdateItem<Project>(Table.PROJECT, projectId, {
        start_date: startDate
    });
};

export const getProjectsByStatus = async (
    statusName: string,
    enterpriseId: string
): Promise<Project[]> => {
    return GetItems<Project>(Table.PROJECT, {
        enterprise_id: {
            id: {
                _eq: enterpriseId
            }
        },
        status_id: {
            name: {
                _eq: statusName
            }
        },
        is_deleted: { _eq: false }
    });
};

export const addAccess = async (
    userId: string,
    projectId: string,
    fullAccess: boolean
): Promise<ProjectAccess> => {
    return CreateItem<ProjectAccess>(Table.PROJECT_ACCESS, {
        user_id: userId,
        project_id: projectId,
        full_access: fullAccess
    });
};
