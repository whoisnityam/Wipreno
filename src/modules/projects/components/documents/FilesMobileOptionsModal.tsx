import React from 'react';
import { Stack, Button, Box } from '@mui/material';
import { t } from 'i18next';
import { X } from 'react-feather';
import { downloadURI, getFileURL } from '../../../../utils';
import { DocumentFile } from '../../models/DocumentFile';
import { TinyButton } from './DocumentFolderComponent';

interface RenderMobileOptionsModalProps {
    selectedFile: DocumentFile | undefined;
    setMobileOptionsModal: Function;
    setFileModifyModal: Function;
    setFileDeleteModal: Function;
}

export const RenderMobileOptionsModal = ({
    selectedFile,
    setMobileOptionsModal,
    setFileModifyModal,
    setFileDeleteModal
}: RenderMobileOptionsModalProps): React.ReactElement => {
    return (
        <Stack>
            <Stack alignItems="flex-end">
                <TinyButton onClick={(): void => setMobileOptionsModal(false)}>
                    <X />
                </TinyButton>
            </Stack>
            <Box height="12px" />
            <Button
                variant="contained"
                onClick={(): void => {
                    if (selectedFile !== undefined) {
                        downloadURI(
                            getFileURL(selectedFile.file_id.id),
                            selectedFile.file_id.filename_download
                        );
                    }
                }}>
                {t('toDownload')}
            </Button>
            <Box height="12px" />
            <Button
                variant="outlined"
                onClick={(): void => {
                    setMobileOptionsModal(false);
                    setFileModifyModal(true);
                }}>
                {t('modifyButtonTitle')}
            </Button>
            <Box height="12px" />
            <Button
                variant="outlined"
                color="error"
                onClick={(): void => {
                    setMobileOptionsModal(false);
                    setFileDeleteModal(true);
                }}>
                {t('deleteButtonTitle')}
            </Button>
        </Stack>
    );
};
