export interface FileData {
    id: string;
    storage: string;
    filename_disk: string;
    filename_download: string;
    title: string;
    type: string;
    uploaded_on: Date;
    modified_on: Date;
}
export const FileFields = [
    'id',
    'storage',
    'filename_disk',
    'filename_download',
    'title',
    'type',
    'uploaded_on',
    'modified_on'
];
