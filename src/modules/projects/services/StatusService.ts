import { ProjectStatus, StatusFields } from '../models/ProjectStatus';
import { CreateItem, GetItems, Table, UpdateItem } from '../../../services/DirectusService';

export const getProjectStatusByEnterpriseId = async (id: string): Promise<ProjectStatus[]> => {
    return GetItems<ProjectStatus>(
        Table.PROJECT_STATUS,
        {
            is_deleted: false,
            enterprise_id: {
                id: { _eq: id }
            }
        },
        ['priority'],
        undefined,
        StatusFields
    );
};

export const createStatus = async (
    name: string,
    priority: number,
    enterpriseId: string
): Promise<ProjectStatus> => {
    return CreateItem<ProjectStatus>(Table.PROJECT_STATUS, {
        name,
        priority,
        enterprise_id: enterpriseId
    });
};

export const deleteStatus = async (id: string): Promise<ProjectStatus> => {
    return UpdateItem<ProjectStatus>(Table.PROJECT_STATUS, id, {
        is_deleted: true
    });
};

export const updateStatusOrder = async (statusList: string[]): Promise<void> => {
    const requests = statusList.map(async (id, index) => {
        await UpdateItem<ProjectStatus>(Table.PROJECT_STATUS, id, {
            priority: index + 1
        });
    });
    await Promise.all(requests);
};
