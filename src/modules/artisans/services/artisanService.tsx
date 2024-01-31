import { API } from '../../../services/ApiService';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { Role } from '../../profile/models/Role';
import { User } from '../../profile/models/User';
import { downloadFile, extractField, isValidPhone, mailformat } from '../../../utils';
import {
    CreateItem,
    CreateItems,
    CreateUser,
    CreateUsers,
    DeleteItem,
    DeleteItems,
    GetItems,
    GetUsers,
    GetUsersById,
    Table,
    UpdateUser
} from '../../../services/DirectusService';
import { readFile } from '../../../utils/FileUtils';
import { Enterprise } from '../../projects/models/Enterprise';
import { ErrorCode } from '../../error/models/ErrorCode';
import { ArtisanFormData } from '../models/ArtisanFormData';
import { ArtisanProjectFields, Project } from '../../projects/models/Project';

export const getArtisans = async (enterpriseId: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.artisan }
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
        },
        ['company_name']
    );
};

export const getArtisanProfession = async (enterpriseId: string): Promise<ArtisanProfession[]> => {
    return GetItems<ArtisanProfession>(
        Table.ARTISAN_PROFESSION,
        { is_deleted: { _eq: false } },
        [],
        {
            _filter: {
                user_id: {
                    role: {
                        name: { _eq: Role.artisan }
                    },
                    enterprises: {
                        enterprise_id: {
                            id: {
                                _eq: enterpriseId
                            }
                        }
                    },
                    is_deleted: { _eq: false }
                }
            }
        }
    );
};

export const getProjectsByArtisanId = async (artisanId: string): Promise<Project[]> => {
    return GetItems<Project>(
        Table.PROJECT,
        {
            notices: {
                lots: {
                    artisan_id: { _eq: artisanId }
                }
            },
            is_deleted: { _eq: false }
        },
        ['-created_at', 'name'],
        {
            notices: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                lots: {
                    _filter: {
                        artisan_id: { _eq: artisanId },
                        is_deleted: false
                    }
                }
            }
        },
        ArtisanProjectFields
    );
};

export const getArtisan = async (email: string): Promise<User | null> => {
    const users = await GetUsers({
        role: {
            name: { _eq: Role.artisan }
        },
        email: { _eq: email }
    });
    if (users.length === 0) {
        return null;
    }
    return users[0];
};

export const saveArtisan = async (
    formData: ArtisanFormData,
    enterpriseId: string
): Promise<void | User> => {
    const artisan = await getArtisan(formData.email_id);
    const data = {
        first_name: formData.contactFirstName,
        last_name: formData.nameOfTheContact,
        email: formData.email_id,
        phone: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        status: 'invited',
        role: '4ac5554b-484e-4bda-83c6-18c46fc95eca',
        company_name: formData.companyName,
        artisan_id: {
            is_deleted: false,
            department: formData.department,
            remark: formData.remark,
            decennial_insurance: formData.decennialInsurance?.id ?? null,
            rib: formData.rib?.id ?? null
        }
    };
    if (!artisan) {
        const user = await CreateUser(data);
        await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
            Table.USER_ENTERPRISE,
            { user_id: user.id, enterprise_id: enterpriseId }
        );
        return user;
    } else {
        if (
            !artisan.enterprises
                .map((enterprise) => enterprise.enterprise_id.id)
                .includes(enterpriseId)
        ) {
            await CreateItem<{ id: string; user_id: string; enterprise_id: string }>(
                Table.USER_ENTERPRISE,
                { user_id: artisan.id, enterprise_id: enterpriseId }
            );
            return UpdateUser(artisan.id, data);
        } else {
            throw new Error(ErrorCode.RECORD_NOTUNIQUE);
        }
    }
};

export const saveProfessions = async (
    artisanId: string,
    profession: string[]
): Promise<ArtisanProfession[]> => {
    return CreateItems<ArtisanProfession>(
        Table.ARTISAN_PROFESSION,
        profession.map((item) => {
            return {
                user_id: artisanId,
                profession: item
            };
        })
    );
};

export const getArtisanById = async (id: string): Promise<User> => {
    return GetUsersById(id);
};

export const getProfessionByUserId = async (id: string): Promise<ArtisanProfession[]> => {
    return GetItems<ArtisanProfession>(Table.ARTISAN_PROFESSION, {
        is_deleted: { _eq: false },
        user_id: {
            id: {
                _eq: id
            }
        }
    });
};

export const removeArtisanUser = async (id: string, enterpriseId: string): Promise<User> => {
    const user = await GetUsersById(id);
    const relationId = user.enterprises.find(
        (enterprise) => enterprise.enterprise_id.id === enterpriseId
    )?.id;
    if (relationId) {
        await DeleteItem(Table.USER_ENTERPRISE, relationId);
    }
    return user;
};

export const updateArtisan = async (data: ArtisanFormData): Promise<User> => {
    return UpdateUser(data.artisanId, {
        first_name: data.contactFirstName,
        last_name: data.nameOfTheContact,
        email: data.email_id,
        phone: data.phoneNumber,
        address: data.address,
        city: data.city,
        company_name: data.companyName,
        artisan_id: {
            department: data.department,
            remark: data.remark,
            decennial_insurance: data.decennialInsurance?.id ?? null,
            rib: data.rib?.id ?? null
        }
    });
};

export const getProfessionByArtisanUserId = async (
    id: string | undefined
): Promise<ArtisanProfession[]> => {
    return GetItems<ArtisanProfession>(Table.ARTISAN_PROFESSION, {
        user_id: {
            id: {
                _eq: id
            }
        }
    });
};

export const deleteProfessionByIds = async (ids: string[]): Promise<void> => {
    await DeleteItems(Table.ARTISAN_PROFESSION, ids);
};

export const getArtisansForBudget = async (enterpriseId: string): Promise<User[]> => {
    return GetUsers(
        {
            role: {
                name: { _eq: Role.artisan }
            },
            enterprises: {
                enterprise_id: {
                    id: { _eq: enterpriseId }
                }
            },
            status: {
                _in: ['active', 'invited']
            }
        },
        ['-created_at']
    );
};

export const exportArtisans = async (enterpriseId: string): Promise<void> => {
    const response = await API.get(`/users`, {
        params: {
            filter: {
                _and: [
                    {
                        role: {
                            name: { _eq: `${Role.artisan}` }
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
                                    _eq: `${enterpriseId}`
                                }
                            }
                        }
                    }
                ]
            },
            'alias[Nom]': 'last_name',
            'alias[Prénom]': 'first_name',
            'alias[E-mail]': 'email',
            'alias[Téléphone]': 'phone',
            'alias[Nom de l’entreprise]': 'company_name',
            fields: `Nom de l’entreprise,Nom,Prénom,E-mail,Téléphone`,
            export: 'csv'
        }
    });
    downloadFile(extractField('profession', response.data, 4), 'artisans.csv');
};

const validateHeader = (headersList: string[]): boolean => {
    let validHeader = true;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < headersList.length; i++) {
        if (headersList.length !== 5) {
            validHeader = false;
        }
        if (
            headersList[0].trim() !== 'Nom de l’entreprise' ||
            headersList[1].trim() !== 'Nom' ||
            headersList[2].trim() !== 'Prénom' ||
            headersList[3].trim() !== 'E-mail' ||
            headersList[4].trim() !== 'Téléphone'
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
            rowValue.length !== 5 ||
            rowValue[0].trim() === null ||
            rowValue[1].trim() === null ||
            rowValue[2].trim() === null ||
            rowValue[3].trim() === null ||
            rowValue[4].trim() === null ||
            !(await isValidPhone(rowValue[4].trim())) ||
            !rowValue[3].trim().match(mailformat)
        );
        if (!isValid) {
            break;
        }
    }
    return isValid;
};

export const importArtisan = async (
    csvfile: File | null,
    enterprise: Enterprise
): Promise<void> => {
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
                company_name: value[0],
                last_name: value[1],
                first_name: value[2],
                email: value[3],
                phone: value[4],
                status: 'invited',
                role: '4ac5554b-484e-4bda-83c6-18c46fc95eca',
                artisan_id: {
                    is_deleted: false
                }
            };
        });

        const existingUsers = await GetUsers({
            role: {
                name: {
                    _eq: Role.artisan
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

export const ImportArtisanSampleData = async (_enterpriseId: string): Promise<void> => {
    let data = '';
    const tableData = [];
    const rows = [
        ['Nom de l’entreprise', 'Nom', 'Prénom', 'E-mail', 'Téléphone'],
        ['company xyz', 'xyz', 'abc', 'xyz@abc.com', '474382923'],
        ['company abc', 'abc', 'xyz', 'abc@xyz.com', '474838923']
    ];
    for (const row of rows) {
        const rowData = [];
        for (const column of row) {
            rowData.push(column);
        }
        tableData.push(rowData.join(';'));
    }
    data += tableData.join('\n');
    downloadFile(extractField('profession', data, 4), 'sample_artisans.csv');
};
