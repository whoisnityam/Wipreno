import { Lot, LotFields } from '../models/Lot';
import { CreateItem, GetItems, Table, UpdateItem } from '../../../services/DirectusService';

export const getLots = async (noticeId: string): Promise<Lot[]> => {
    return GetItems<Lot>(
        Table.LOT,
        {
            notice_id: {
                id: {
                    _eq: noticeId
                }
            },
            is_deleted: { _eq: false }
        },
        ['priority'],
        {
            planning_tasks: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                _sort: ['created_at']
            },
            estimation_tasks: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                _sort: ['priority']
            },
            budgets: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                _sort: ['created_at']
            }
        },
        LotFields
    );
};

export const createLot = async (
    title: string,
    priority: number | null,
    projectId: string | null,
    noticeId: string
): Promise<Lot> => {
    return CreateItem<Lot>(Table.LOT, {
        title,
        priority,
        project_id: projectId,
        notice_id: noticeId,
        tax: '200000'
    });
};

export const deleteLot = async (id: string): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, id, {
        is_deleted: true
    });
};

export const modifyLot = async (id: string, title: string): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, id, {
        title
    });
};

export const updateLotOrder = async (lotList: string[]): Promise<void> => {
    const requests = lotList.map(async (id, index) => {
        await UpdateItem<Lot>(Table.LOT, id, {
            priority: index + 1
        });
    });
    await Promise.all(requests);
};

export const updateLotTax = async (lotId: string, tax: number): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, lotId, {
        tax
    });
};

export const addDateToLot = async (
    id: string,
    name: string,
    startDate: Date,
    endDate: Date,
    color: string
): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, id, {
        title: name,
        start_date: startDate,
        end_date: endDate,
        lot_color: color
    });
};

export const updateArtisan = async (
    id: string,
    artisanId: string,
    amountHT: number,
    amountTTC: number
): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, id, {
        artisan_id: artisanId,
        amount_HT: amountHT,
        amount_TTC: amountTTC
    });
};

export const updateLotDate = async (id: string, startDate: Date, endDate: Date): Promise<Lot> => {
    return UpdateItem<Lot>(Table.LOT, id, {
        start_date: startDate,
        end_date: endDate
    });
};
