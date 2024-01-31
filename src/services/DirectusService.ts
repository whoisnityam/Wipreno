import { API } from './ApiService';
import { User, UserFields } from '../modules/profile/models/User';
import { FileData } from '../modules/projects/models/FileData';
import { DirectusError } from '../modules/error/models/ErrorCode';
import { AxiosResponse } from 'axios';

export enum Table {
    ARTISAN = 'artisan',
    ARTISAN_PROFESSION = 'artisan_profession',
    BUDGET = 'budget',
    CLIENT_CONTACT = 'client_contact',
    COMMENT = 'comment',
    CONSULTATION = 'consultation',
    CONSULTATION_DOCUMENT = 'consultation_document',
    CURRENT_USER = 'users_me',
    DEPENDENT_TASK = 'dependent_task',
    DISCUSSION_GROUP = 'discussion_group',
    USER_DISCUSSIONGROUP = 'user_discussion_group',
    DISCUSSION = 'discussion',
    DOCUMENT_FILE = 'document_file',
    DOCUMENT_FOLDER = 'document_folder',
    ENTERPRISE = 'enterprise',
    FILE = 'files',
    LOT = 'lot',
    NOTICE = 'notice',
    NOTIFICATION = 'notification',
    PROFITABILITY = 'profitability',
    PROJECT = 'project',
    PROJECT_STATUS = 'project_status',
    REPORT = 'report',
    REPORT_ITEM = 'report_item',
    REPORT_ATTACHMENT = 'report_item_attachment',
    SEEN_NOTIFICATION = 'seen_notification',
    SLOT = 'slot',
    SUBSCRIPTION_PLAN = 'subscription_plan',
    ESTIMATIONTASK = 'estimation_task',
    PLANNINGTASK = 'planning_task',
    USER_ENTERPRISE = 'user_enterprise',
    USER = 'users',
    PROJECT_ACCESS = 'project_access'
}

export enum Auth {
    LOGIN = 'login',
    REFRESH = 'refresh',
    FORGOT_PASSWORD = 'password/request',
    RESET_PASSWORD = 'password/reset',
    LOGOUT = 'logout'
}

export enum MailEndpoint {
    CONFIRM_EMAIL = 'confirm-email'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newDirectusError(error: any): DirectusError {
    return error.response.data.errors[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AuthRequest(endpoint: Auth, data?: Object): Promise<AxiosResponse<any>> {
    return API.post(`auth/${endpoint}`, data)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function GetCurrentUser(): Promise<User> {
    return API.get(`/users/me`, {
        params: { fields: UserFields.join(',') }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function AcceptInvite(data: object): Promise<void> {
    return API.post('/users/invite/accept', data)
        .then(() => {
            return;
        })
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function GetUsers(filter?: object, sort?: string[], limit = -1): Promise<User[]> {
    return API.get(`/users`, {
        params: { fields: UserFields.join(','), filter, sort, limit }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function GetUsersById(id: string): Promise<User> {
    return API.get(`/users/${id}`, {
        params: { fields: UserFields.join(',') }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export async function GetUserByEmail(email: string): Promise<User | undefined> {
    const users = await GetUsers({ email: { _eq: email } }, [], 1);
    return users.at(0);
}

export function GetItemById<T>(
    table: string,
    id: string,
    filter?: object,
    deep?: object,
    fields?: string[]
): Promise<T> {
    return API.get(`/items/${table}/${id}`, {
        params: { fields: fields?.join(',') ?? '*.*.*', filter, deep }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function UpdateCurrentUser(data: object): Promise<User> {
    return API.patch(`/users/me`, data)
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function CreateUser(data: object): Promise<User> {
    return API.post(`/users`, data)
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function CreateUsers(data: object): Promise<User[]> {
    return API.post(`/users`, data)
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function UpdateUser(id: string, data: object): Promise<User> {
    return API.patch(`/users/${id}`, data)
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function UpdateUsers(data: User[]): Promise<User> {
    return API.patch(`/users`, { keys: data.map((value) => value.id), data })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function DeleteUser(id: string): Promise<void> {
    return API.patch(`/users/${id}`, {
        status: 'archived',
        first_name: 'Utilisateur',
        last_name: 'Supprimé',
        email: `${id}@archived.com`,
        subscription_plan_id: null
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function GetItem<T>(table: string, filter: object, fields?: string[]): Promise<T> {
    return API.get(`/items/${table}`, {
        params: { fields: fields?.join(',') ?? '*.*.*', filter, limit: 1 }
    }).then((response) => {
        const data = response.data.data;
        if (data.length === 1) {
            return data[0];
        } else {
            throw new Error('Item not found');
        }
    });
}

export function GetItems<T>(
    table: string,
    filter?: object,
    sort?: string[],
    deep?: object,
    fields?: string[]
): Promise<T[]> {
    return API.get(`/items/${table}`, {
        params: { fields: fields?.join(',') ?? '*.*.*', filter, sort, limit: -1, deep }
    }).then((response) => response.data.data);
}

export function CreateItem<T>(table: Table, data: object, fields?: string[]): Promise<T> {
    return API.post(`/items/${table}`, data, {
        params: { fields: fields?.join(',') ?? '*' }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function CreateItems<T>(table: Table, data: object): Promise<T[]> {
    return API.post(`/items/${table}`, data)
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export function UpdateItem<T>(
    table: Table,
    id: string,
    data: object,
    fields?: string[]
): Promise<T> {
    return API.patch(`/items/${table}/${id}`, data, {
        params: { fields: fields?.join(',') ?? '*.*.*' }
    })
        .then((response) => response.data.data)
        .catch((error) => {
            throw newDirectusError(error);
        });
}

export async function DeleteItem(table: Table, id: string): Promise<void> {
    await API.delete(`items/${table}/${id}`).catch((error) => {
        throw newDirectusError(error);
    });
}

export async function DeleteItems(table: Table, ids: string[]): Promise<void> {
    await API.delete(`items/${table}`, { data: ids }).catch((error) => {
        throw newDirectusError(error);
    });
}

export const uploadFile = async (document: File): Promise<FileData> => {
    const formData = new FormData();
    formData.append('title', document.name);
    formData.append('file', document);
    const res = await API.post('/files', formData);
    return res.data.data;
};

export const DeleteFiles = async (ids: string[]): Promise<FileData> => {
    const res = await API.delete('/files', { data: ids });
    return res.data.data;
};

export const deleteFile = async (id: string): Promise<void> => {
    await API.delete(`files/${id}`).catch((error) => {
        throw newDirectusError(error);
    });
};

export function SendMail(endpoint: MailEndpoint, data: object): Promise<void> {
    return API.post(`mail/${endpoint}`, data)
        .then(() => {
            return;
        })
        .catch((error) => {
            throw newDirectusError(error);
        });
}
