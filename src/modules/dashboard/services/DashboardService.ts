import { Notification } from '../models/Notification';
import { CreateItem, GetItems, Table } from '../../../services/DirectusService';

export const getNotifications = async (enterpriseId: string): Promise<Notification[]> => {
    return GetItems<Notification>(Table.NOTIFICATION, {
        enterprise_id: {
            id: {
                _eq: enterpriseId
            }
        },
        is_deleted: { _eq: false }
    });
};

export const createNotification = async (
    enterpriseId: string,
    artisanId: string | null,
    consultationId: string | null,
    reportId: string | null
): Promise<Notification> => {
    return CreateItem<Notification>(Table.NOTIFICATION, {
        user_id: artisanId,
        enterprise_id: enterpriseId,
        consultation_id: consultationId,
        report_id: reportId
    });
};

export const markAsSeen = async (
    userId: string,
    notificationId: string
): Promise<{ user_id: string; notification_id: string }> => {
    return CreateItem<{ user_id: string; notification_id: string }>(Table.SEEN_NOTIFICATION, {
        user_id: userId,
        notification_id: notificationId
    });
};
