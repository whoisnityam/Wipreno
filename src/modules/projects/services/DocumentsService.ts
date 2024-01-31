import {
    CreateItem,
    DeleteFiles,
    GetItemById,
    GetItems,
    Table,
    UpdateItem,
    uploadFile
} from '../../../services/DirectusService';
import { ProjectStatus } from '../../artisans/models/projectStatus';
import { DocumentFile, DocumentFileFields } from '../models/DocumentFile';
import { DocumentFolder, DocumentFolderFields } from '../models/DocumentFolder';
import { Project } from '../models/Project';

export const getDocumentFolders = async (
    projectId: string,
    type: string
): Promise<DocumentFolder[]> => {
    return GetItems<DocumentFolder>(
        Table.DOCUMENT_FOLDER,
        {
            project_id: {
                id: {
                    _eq: projectId
                }
            },
            type: { _eq: type },
            is_deleted: { _eq: false }
        },
        ['-modified_at'],
        {
            files: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                _sort: ['-modified_at']
            }
        },
        DocumentFolderFields
    );
};

export const getDocumentFolderById = async (folderId: string): Promise<DocumentFolder> => {
    return GetItemById<DocumentFolder>(
        Table.DOCUMENT_FOLDER,
        folderId,
        {
            is_deleted: { _eq: false }
        },
        {
            files: {
                _filter: {
                    is_deleted: { _eq: false }
                },
                _sort: ['-modified_at']
            }
        },
        DocumentFolderFields
    );
};

export const createDocumentFolder = async (
    name: string,
    projectId: string,
    type: string
): Promise<DocumentFolder> => {
    return CreateItem<DocumentFolder>(
        Table.DOCUMENT_FOLDER,
        {
            name,
            project_id: projectId,
            type
        },
        DocumentFolderFields
    );
};

export const deleteDocumentFolder = async (folder: DocumentFolder): Promise<DocumentFolder> => {
    return UpdateItem<DocumentFolder>(Table.DOCUMENT_FOLDER, folder.id, {
        is_deleted: true,
        files: folder.files?.map((item) => ({
            id: item.id,
            is_deleted: true
        }))
    });
};

export const addDocumentFile = async (folderId: string, file: File): Promise<DocumentFile> => {
    const uploadedFile = await uploadFile(file);
    return CreateItem<DocumentFile>(
        Table.DOCUMENT_FILE,
        {
            folder_id: folderId,
            file_id: uploadedFile
        },
        DocumentFileFields
    );
};

export const deleteDocumentFile = async (fileId: string): Promise<DocumentFile> => {
    return UpdateItem<DocumentFile>(Table.DOCUMENT_FILE, fileId, {
        is_deleted: true
    });
};

export const modifyDocumentFile = async (
    documentFile: DocumentFile,
    file: File | undefined,
    folderId: string
): Promise<DocumentFile> => {
    if (file !== undefined) {
        const uploadedFile = await uploadFile(file);
        const res = await UpdateItem<DocumentFile>(Table.DOCUMENT_FILE, documentFile.id, {
            folder_id: folderId,
            file_id: uploadedFile
        });
        DeleteFiles([documentFile.file_id.id]);
        return res;
    } else {
        return UpdateItem<DocumentFile>(Table.DOCUMENT_FILE, documentFile.id, {
            folder_id: folderId
        });
    }
};

export const modifyDocumentFolderName = async (
    folderId: string,
    folderName: string
): Promise<DocumentFolder> => {
    return UpdateItem<DocumentFolder>(Table.DOCUMENT_FOLDER, folderId, {
        name: folderName
    });
};

export const isProjectArchived = async (projectId: string): Promise<boolean> => {
    const response = await GetItemById<Project>(Table.PROJECT, projectId, {}, {}, [
        'status_id.name'
    ]);
    if (
        response.status_id.name === ProjectStatus.completedProject ||
        response.status_id.name === ProjectStatus.lostProject
    ) {
        return true;
    }
    return false;
};
