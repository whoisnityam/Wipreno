import { API } from '../../../services/ApiService';
import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { ClientContact } from '../models/ClientContact';
import { downloadFile, extractField, isValidPhone, mailformat } from '../../../utils';
import {
    CreateItem,
    CreateItems,
    CreateUser,
    CreateUsers,
    DeleteItem,
    GetItems,
    GetUsers,
    GetUsersById,
    Table,
    UpdateItem,
    UpdateUser
} from '../../../services/DirectusService';
import { readFile } from '../../../utils/FileUtils';
import { Enterprise } from '../../projects/models/Enterprise';

export const getClients = async (enterpriseId: string): Promise<User[]> => {
    return GetUsers({
        role: {
            name: { _eq: Role.client }
        },
        enterprises: {
            enterprise_id: {
                id: {
                    _eq: enterpriseId
                }
            }
        },
        status: {
            _in: ['active', 'invited']
        }
    });
};

export const getProjectsByEnterpriseId = async (enterpriseId: string): Promise<Project[]> => {
    return GetItems<Project>(Table.PROJECT, {
        enterprise_id: {
            id: {
                _eq: enterpriseId
            }
        },
        is_deleted: { _eq: false }
    });
};

export const getClient = async (email: string): Promise<User | null> => {
    const users = await GetUsers({
        role: {
            name: { _eq: Role.client }
        },
        email: { _eq: email }
    });
    if (users.length === 0) {
        return null;
    }
    return users[0];
};

// Add new client.
export const addClient = async (
    address: string | null,
    postalCode: string | null,
    city: string | null,
    status: string | null,
    clientLastName: string | null,
    clientFirstName: string | null,
    email: string,
    phoneNumber: string | null,
    userId: User,
    companyName?: string | null
): Promise<void | User> => {
    const enterpriseId = userId.enterprises.at(0)!.enterprise_id.id;
    const client = await getClient(email);
    const data = {
        first_name: clientFirstName,
        last_name: clientLastName,
        email,
        phone: phoneNumber,
        address,
        postal_code: postalCode,
        city,
        status: 'invited',
        client_status: status,
        role: '6d09fd61-ff65-4927-b133-9152962e9023',
        company_name: companyName
    };
    if (!client) {
        const user = await CreateUser({ ...data, status: 'invited' });
        await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
            Table.USER_ENTERPRISE,
            { user_id: user.id, enterprise_id: enterpriseId }
        );
        return user;
    } else {
        if (
            !client.enterprises
                .map((enterprise) => enterprise.enterprise_id.id)
                .includes(enterpriseId)
        ) {
            await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
                Table.USER_ENTERPRISE,
                { user_id: client.id, enterprise_id: enterpriseId }
            );
            return UpdateUser(client.id, data);
        } else {
            return UpdateUser(client.id, data);
        }
    }
};

export const modifySelectedClient = async (
    clientLastName: string | null,
    clientFirstName: string | null,
    phoneNumber: string | null,
    id: string
): Promise<void | User> => {
    return UpdateUser(id, {
        first_name: clientFirstName,
        last_name: clientLastName,
        phone: phoneNumber
    });
};

// Add client contacts
export const addClientContacts = async (
    client: User,
    contactLastName: string,
    contactFirstName: string,
    contactEmail: string,
    contactPhoneNumber: string
): Promise<void | User> => {
    const response = await API.post('/items/client_contact', {
        first_name: contactFirstName,
        last_name: contactLastName,
        email: contactEmail,
        phone: contactPhoneNumber,
        user_id: client.id
    });
    return response.data.data;
};

export const patchClientContact = async (
    contactId: string,
    contactLastName: string,
    contactFirstName: string,
    contactEmail: string,
    contactPhoneNumber: string
): Promise<void | User> => {
    const response = await API.patch(`/items/client_contact/${contactId}`, {
        first_name: contactFirstName,
        last_name: contactLastName,
        email: contactEmail,
        phone: contactPhoneNumber
    });
    return response.data.data;
};

export const getClientContacts = async (client: User): Promise<ClientContact[]> => {
    return GetItems<ClientContact>(Table.CLIENT_CONTACT, {
        user_id: {
            id: {
                _eq: client.id
            }
        },
        is_deleted: { _eq: false }
    });
};

export const getProjectsByClientId = async (clientId: string): Promise<Project[]> => {
    return GetItems<Project>(Table.PROJECT, {
        client_id: {
            id: {
                _eq: clientId
            }
        }
    });
};

export const deleteProjectClient = async (projectId: string): Promise<Project> => {
    return UpdateItem<Project>(Table.PROJECT, projectId, {
        client_id: null
    });
};

export const removeClient = async (
    clientId: string,
    enterpriseId: string
): Promise<void | User> => {
    const projects = await getProjectsByClientId(clientId);
    projects.map(async (project) => {
        await deleteProjectClient(project.id);
    });
    const user = await GetUsersById(clientId);
    const relationId = user.enterprises.find(
        (enterprise) => enterprise.enterprise_id.id === enterpriseId
    )?.id;
    if (relationId) {
        await DeleteItem(Table.USER_ENTERPRISE, relationId);
    }
    return user;
};

export const deleteContact = async (contactId: string): Promise<void | ClientContact> => {
    const response = await API.patch(`/items/client_contact/${contactId}`, {
        is_deleted: true
    });
    return response.data.data;
};

export const exportClients = async (enterpriseId: string): Promise<void> => {
    const response = await API.get('/users', {
        params: {
            'alias[Nom]': 'last_name',
            'alias[Prénom]': 'first_name',
            'alias[E-mail]': 'email',
            'alias[Téléphone]': 'phone',
            fields: 'Nom,Prénom,E-mail,Téléphone',
            export: 'csv',
            filter: {
                _and: [
                    {
                        role: {
                            name: {
                                _eq: Role.client
                            }
                        }
                    },
                    {
                        status: {
                            _in: ['active', 'invited']
                        }
                    },
                    {
                        enterprises: {
                            enterprise_id: {
                                id: {
                                    _eq: enterpriseId
                                }
                            }
                        }
                    }
                ]
            }
        }
    });
    downloadFile(extractField('name', response.data, 3), 'clients.csv');
};

const validateHeader = (headersList: string[]): boolean => {
    let validHeader = true;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < headersList.length; i++) {
        if (headersList.length !== 4) {
            validHeader = false;
        }
        if (
            headersList[0].trim() !== 'Nom' ||
            headersList[1].trim() !== 'Prénom' ||
            headersList[2].trim() !== 'E-mail' ||
            headersList[3].trim() !== 'Téléphone'
        ) {
            validHeader = false;
        }
    }

    return validHeader;
};

const validateRows = async (rows: string[][]): Promise<boolean> => {
    let isValid = true;
    for (const rowValue of rows) {
        isValid = !(
            rowValue.length !== 4 ||
            rowValue[0].trim() === null ||
            rowValue[1].trim() === null ||
            rowValue[2].trim() === null ||
            rowValue[3].trim() === null ||
            !(await isValidPhone(rowValue[3].trim())) ||
            !rowValue[2].trim().match(mailformat)
        );
        if (!isValid) {
            break;
        }
    }
    return isValid;
};

export const importClient = async (csvfile: File | null, enterprise: Enterprise): Promise<void> => {
    if (csvfile) {
        const csvData = await readFile(csvfile);
        if (!validateHeader(csvData.header)) {
            throw new Error('Invalid headers');
        }
        if (!(await validateRows(csvData.values))) {
            throw new Error('Invalid Rows');
        }
        const userInfo = csvData.values.map((value) => {
            return {
                last_name: value[0],
                first_name: value[1],
                email: value[2],
                phone: value[3],
                status: 'invited',
                role: '6d09fd61-ff65-4927-b133-9152962e9023'
            };
        });
        const existingUsers = await GetUsers({
            role: {
                name: {
                    _eq: Role.client
                }
            },
            email: {
                _in: userInfo.map((user) => user.email)
            },
            status: {
                _in: ['active', 'invited']
            }
        });

        const newUsers = userInfo.filter(
            (value) => !existingUsers.map((user) => user.email).includes(value.email)
        );

        if (newUsers.length > 0) {
            const users = await CreateUsers(newUsers);
            await CreateItems<{ id: string; user_id: string; enterprise_id: string }>(
                Table.USER_ENTERPRISE,
                users.map((value) => {
                    return { user_id: value.id, enterprise_id: enterprise.id };
                })
            );
        } else {
            const filtered = existingUsers.filter(
                (user) =>
                    !user.enterprises.map((item) => item.enterprise_id.id).includes(enterprise.id)
            );
            await CreateItems<{ id: string; user_id: string; enterprise_id: string }>(
                Table.USER_ENTERPRISE,
                filtered.map((value) => {
                    return { user_id: value.id, enterprise_id: enterprise.id };
                })
            );
        }
    }
};

export const ImportClientSampleData = async (_enterpriseId: string): Promise<void> => {
    let data = '';
    const tableData = [];
    const rows = [
        ['Nom', 'Prénom', 'E-mail', 'Téléphone'],
        ['abc', 'xyz', 'xyz@abc.com', '474838292'],
        ['xyz', 'abc', 'abc@xyz.com', '474838292']
    ];
    for (const row of rows) {
        const rowData = [];
        for (const column of row) {
            rowData.push(column);
        }
        tableData.push(rowData.join(';'));
    }
    data += tableData.join('\n');
    downloadFile(extractField('profession', data, 4), 'sample_clients.csv');
};

export const getClientById = async (id: string): Promise<User> => {
    return GetUsersById(id);
};
