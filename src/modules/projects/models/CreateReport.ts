import { LotViewDataForReport } from './Lot';
import { FileData } from './FileData';

export interface LotComments {
    comment: string;
    fileUploaded: FileList | null;
    files: FileData[];
    lot_id: string | null;
    id: string | null;
    fileDetails: {
        fileName: string;
        fileId: string;
        attachmentId: string;
    }[];
}

export interface CreateReport {
    lot: LotViewDataForReport;
    commentInfo: LotComments[];
}
