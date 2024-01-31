import { TFunction } from 'i18next';
import { string, StringSchema } from 'yup';
import { BASE_URL } from '../services/ApiService';
import * as yup from 'yup';
import 'yup-phone';

export const stringAvatar = (firstName = '', lastName = ''): string => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toLocaleUpperCase();
};

export const passwordValidationSchema = (rules: string): StringSchema => {
    return string()
        .min(8, rules)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%])(?=.{8,})/, rules);
};

export const isValidPhone = (number: string): Promise<boolean> => {
    const schema = yup.object({
        number: yup.string().phone('FR')
    });

    return schema.isValid({ number }).then((valid) => {
        return valid;
    });
};

export const getDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const equals = <T>(value1: T, value2: T): boolean => {
    return JSON.stringify(value1) === JSON.stringify(value2);
};

export const getErrorMessage = (code: string, t: TFunction): string => {
    switch (code) {
        case 'INVALID_CREDENTIALS':
            return t('invalidCredentialsErrorMessage');
        case 'RECORD_NOT_UNIQUE':
            return t('userAlreadyExistsError');
        default:
            return t('serverErrorPageTitle');
    }
};

export const convertToUiValue = (value: number | undefined): number => {
    if (value) {
        return value / 10000;
    } else {
        return 0;
    }
};

export const mailformat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z-]+)*$/;

export const convertToDbValue = (value: number): number => {
    return Number((value * 10000).toFixed(0));
};

export const getFormatedDate = (createdDate: Date): string => {
    const date = new Date(createdDate);
    const formatedDate = date.toLocaleDateString();
    return formatedDate;
};

export const checkDate = (value: string): Boolean => {
    const regex =
        /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
    return regex.test(value);
};

export function downloadURI(uri: string, name: string): void {
    const link = document.createElement('a');
    link.download = name;
    link.href = `${uri}?download`;
    document.body.appendChild(link);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    document.body.removeChild(link);
}

export const downloadFile = (data: string, fileName: string): void => {
    // to trigger a download
    const universalBOM = '\uFEFF';
    const a = document.createElement('a');
    a.setAttribute(
        'href',
        'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + data)
    );
    a.download = fileName;
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    a.dispatchEvent(clickEvt);
    a.remove();
};

export const extractField = (name: string, text: string, numFields?: number): string => {
    let newText = text
        .replaceAll(`{""${name}"":""`, '')
        .replaceAll('""}', '')
        .replaceAll('[', '')
        .replaceAll(']', '')
        .replaceAll('"', '')
        .split('\n');
    if (numFields) {
        newText = newText.map((line) => {
            let newLine = line;
            for (let i = 0; i < numFields; i++) {
                newLine = newLine.replace(',', ';');
            }
            return newLine;
        });
    }

    return newText.join('\n');
};

export const getFileURL = (id: string, fit?: string, width?: string, height?: string): string => {
    const myUrlWithParams = new URL(BASE_URL + '/assets/' + id);
    if (fit) {
        myUrlWithParams.searchParams.append('fit', fit!);
    }
    if (width) {
        myUrlWithParams.searchParams.append('width', width!);
    }
    if (height) {
        myUrlWithParams.searchParams.append('height', height!);
    }
    return myUrlWithParams.href;
};

export const formatDate = (inputDate: Date): Date => {
    const date = new Date(inputDate);
    const d = date.toString();
    return new Date(d);
};

export const CheckSentenceStartsWith = (item: string, searchText: string): boolean => {
    const words = item.split(' ');
    const check = words.map((word) => {
        return word.toLocaleLowerCase().startsWith(searchText.toLocaleLowerCase());
    });
    return check.includes(true);
};

export const getFullName = (
    firstName: string | undefined,
    lastName: string | undefined
): string => {
    if (!firstName || !lastName) return '';
    if (!lastName) return firstName;
    return `${firstName} ${lastName}`;
};

const getWRMonth = (a: number): string => {
    switch (a) {
        case 0:
            return 'Janv.';
        case 1:
            return 'Févr.';
        case 2:
            return 'Mars';
        case 3:
            return 'Avril';
        case 4:
            return 'Mai';
        case 5:
            return 'Juin';
        case 6:
            return 'Juil.';
        case 7:
            return 'Août';
        case 8:
            return 'Sept.';
        case 9:
            return 'Oct.';
        case 10:
            return 'Nov.';
        case 11:
            return 'Déc.';
        default:
            return '';
    }
};

export const getDiscussionsDate = (date: Date): string => {
    const formattedDate = new Date(date);
    const discussionDate = formattedDate.getDate();
    const discussionMonth = formattedDate.getMonth();
    return discussionDate + ' ' + getWRMonth(discussionMonth);
};

export const postalCheck = (postalCode: string): string | undefined => {
    let postal = postalCode.toString();
    if (postalCode !== '') {
        if (postal.length === 4) {
            postal = '0' + postalCode;
        }
    }
    return postal;
};
