import { Budget, BudgetInterface } from '../models/Budget';
import { Lot } from '../models/Lot';
import { CreateItem, Table, UpdateItem } from '../../../services/DirectusService';
import { getLots } from './LotService';

export const getLotsForBudget = async (noticeId: string): Promise<Lot[]> => {
    return getLots(noticeId);
};

export const createBudget = async (data: BudgetInterface): Promise<void> => {
    await CreateItem<Budget>(Table.BUDGET, data);
};

export const deleteValue = async (id: string): Promise<Budget> => {
    return UpdateItem<Budget>(Table.BUDGET, id, {
        is_deleted: true
    });
};
