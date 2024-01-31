import { API, APP_BASE_URL, ListRequest } from '../../../services/ApiService';
import { Lot } from '../models/Lot';

export const exportPlanning = async (
    noticeId: string,
    showCompany?: boolean,
    showTasks?: boolean
): Promise<void> => {
    await API.post(
        '/export/planning',
        {
            noticeId,
            showCompany,
            showTasks
        },
        { responseType: 'blob' }
    ).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'planning.pdf'); //or any other extension
        document.body.appendChild(link);
        link.click();
    });
};

export const sendPlanningViaEmail = async (
    noticeId: string,
    showCompany: boolean,
    showTasks: boolean,
    enterpriseName: string,
    projectName: string,
    emails: string[]
): Promise<void> => {
    await API.post('/mail/share-planning', {
        noticeId,
        showCompany,
        showTasks,
        enterpriseName,
        projectName,
        emails,
        appLink: APP_BASE_URL
    });
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
    const taskFilter = `
        filter: {
            is_deleted: { _eq: false },
            materials: {_eq: true }
        }
    `;
    const query = `
        {
            lot(${filter}, sort: ["priority"], limit: -1){
                id,
                title,
                priority,
                tasks(${taskFilter}, sort: ["priority"], limit: -1) {
                    id,
                    title,
                    priority,
                    unit,
                    quantity,
                    unit_price,
                    tax,
                    materials
                }
            }
        }
    `;

    return ListRequest<Lot>(query, 'lot');
};

export const downloadCSV = async (
    noticeId: string,
    showPrices: boolean,
    priceType: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let res: any;
    await API.post(
        'export/notice',
        {
            noticeId,
            showPrices,
            priceType
        },
        { responseType: 'arraybuffer' }
    )
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'notice.xlsx'); //or any other extension
            document.body.appendChild(link);
            link.click();
            res = response.data;
        })
        .catch(() => {
            res = null;
        });
    return res;
};
