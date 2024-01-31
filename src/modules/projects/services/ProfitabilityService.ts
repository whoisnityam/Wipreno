import { Profitability } from '../models/Profitablity';
import { CreateItem, GetItems, Table, UpdateItem } from '../../../services/DirectusService';

export const getProfitabilityByProjectId = async (
    projectId: string
): Promise<Profitability | null> => {
    const response = await GetItems<Profitability>(Table.PROFITABILITY, {
        project_id: {
            id: {
                _eq: projectId
            }
        }
    });
    if (response.length > 0) {
        return response[0];
    } else {
        return null;
    }
};

export const createProfit = async (data: Profitability): Promise<Profitability> => {
    return CreateItem<Profitability>(Table.PROFITABILITY, data);
};

export const updateProfit = async (data: Profitability): Promise<Profitability> => {
    return UpdateItem<Profitability>(Table.PROFITABILITY, data.id, data);
};
