import { API, APP_BASE_URL, ListRequest } from '../../../services/ApiService';
import { Lot } from '../models/Lot';
import { CreateReport } from '../models/CreateReport';
import { Project } from '../models/Project';
import { Report, ReportFields } from '../models/Report';
import {
    GetItems,
    GetItemById,
    Table,
    UpdateItem,
    uploadFile,
    CreateItem
} from '../../../services/DirectusService';

export const getReports = async (projectId: string): Promise<Report[]> => {
    return GetItems<Report>(
        Table.REPORT,
        {
            project_id: {
                id: {
                    _eq: projectId
                }
            },
            is_deleted: { _eq: false }
        },
        ['-created_at'],
        undefined,
        ReportFields
    );
};

export const getReport = async (id: string): Promise<Report> => {
    return GetItemById<Report>(
        Table.REPORT,
        id,
        { is_deleted: { _eq: false } },
        undefined,
        ReportFields
    );
};

export const createReport = async (project: Project, data: CreateReport[]): Promise<Report> => {
    const updatedData: CreateReport[] = [...data];
    await Promise.all(
        updatedData.map(async (lot) => {
            await Promise.all(
                lot.commentInfo.map(async (comment) => {
                    if (comment.fileUploaded) {
                        const list = Array.from(comment.fileUploaded);
                        const files = await Promise.all(list.map((ele) => uploadFile(ele)));
                        comment.files = [...files];
                    }
                })
            );
        })
    );

    const items: { comment: string; lot_id: string | null; attachments: { file: string }[] }[] = [];

    updatedData.map((lot) => {
        return lot.commentInfo.map((item) => {
            items.push({
                comment: item.comment,
                lot_id: item.lot_id,
                attachments: item.files.map((file) => {
                    return {
                        file: file.id
                    };
                })
            });
        });
    });
    const res = await CreateItem<Report>(Table.REPORT, {
        project_id: {
            id: project.id,
            start_date: project.start_date
        },
        items
    });
    return res;
};

export const getLotsByProjectId = async (projectId: string): Promise<Lot[]> => {
    const filter = `
        filter: {
            project_id: {
                id: {
                    _eq: "${projectId}"
                }
            },
            is_deleted: { _eq: false }
        }
   `;
    const deletedFilter = `
        filter: {
            is_deleted: { _eq: false }
        }
    `;
    const query = `
        {
            lot(${filter}, sort: ["priority"], limit: -1){
                id,
                title,
                lot_color,
                start_date,
                end_date,
                priority,
                planning_tasks(${deletedFilter}, limit: -1) {
                    id,
                    title,
                    start_date,
                    end_date,
                    dependencies {
                        task_id {
                            id
                        }
                    }
                },
                artisan_id {
                    id,
                    first_name,
                    last_name,
                    company_name,
                    email,
                    phone
                }
            }
        }
    `;

    return ListRequest<Lot>(query, 'lot');
};

export const deleteReport = async (reportId: string): Promise<Report> => {
    return UpdateItem<Report>(Table.REPORT, reportId, {
        is_deleted: true
    });
};

export const updateReport = async (
    project: Project,
    data: CreateReport[],
    reportId: string
): Promise<Report> => {
    const updatedData = [...data];
    await Promise.all(
        updatedData.map(async (lot) => {
            await Promise.all(
                lot.commentInfo.map(async (lotComment) => {
                    if (lotComment.fileUploaded) {
                        const list = Array.from(lotComment.fileUploaded);
                        const files = await Promise.all(
                            list.map((ele) => {
                                return uploadFile(ele);
                            })
                        );
                        lotComment.files.push(...files);
                    }
                })
            );
        })
    );
    const items: { comment: string; lot_id: string | null; attachments: { file: string }[] }[] = [];

    updatedData.map((lot) => {
        return lot.commentInfo.map((item) => {
            items.push({
                comment: item.comment,
                lot_id: item.lot_id,
                attachments: item.files.map((file) => {
                    return {
                        file: file.id
                    };
                })
            });
        });
    });

    return UpdateItem<Report>(Table.REPORT, reportId, {
        project_id: {
            id: project.id,
            start_date: project.start_date
        },
        items
    });
};

export const sendReport = async (
    toWhom: string,
    enterpriseId: string,
    projectId: string,
    reportId: string,
    noticeId: string,
    projectName: string,
    enterpriseName: string
): Promise<void> => {
    await API.post('mail/send-report', {
        toWhom,
        enterprise_id: enterpriseId,
        project_id: projectId,
        report_id: reportId,
        notice_id: noticeId,
        projectName,
        enterpriseName,
        appLink: APP_BASE_URL
    });
};
export const ReportDownload = async (
    projectId: string,
    reportId: string,
    noticeId: string,
    showCompany: boolean
): Promise<void> => {
    await API.post(
        'export/report',
        {
            project_id: projectId,
            report_id: reportId,
            notice_id: noticeId,
            showCompany
        },
        { responseType: 'blob' }
    ).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Compte rendu wipreno.pdf');
        document.body.appendChild(link);
        link.click();
    });
};
