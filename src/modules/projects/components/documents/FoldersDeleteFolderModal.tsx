import { LoadingButton } from '@mui/lab';
import { Stack, Typography, Button, useMediaQuery, useTheme, Box } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useIsMounted } from '../../../../components/Hooks/useIsMounted';
import { DocumentFolder } from '../../models/DocumentFolder';
import { deleteDocumentFolder } from '../../services/DocumentsService';

interface RenderDeleteFolderModalProps {
    selectedFolder: undefined | DocumentFolder;
    folders: DocumentFolder[];
    isMounted: boolean;
    setFolders: Function;
    setDeleteFolderModal: Function;
    setDeleteFolderSuccess: Function;
}

export const RenderDeleteFolderModal = ({
    selectedFolder,
    folders,
    isMounted,
    setFolders,
    setDeleteFolderModal,
    setDeleteFolderSuccess
}: RenderDeleteFolderModalProps): React.ReactElement => {
    const theme = useTheme();
    const [buttonLoading, setButtonLoading] = useState(false);
    const _isMounted = useIsMounted();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Stack>
            <Typography variant={isLarge ? 'h4' : 'h5'} textAlign="center">
                {t('deleteFolderConfirmation')}
            </Typography>
            <Box height="24px" />
            <Typography variant="body1" textAlign="center">
                {t('deleteFolderSubtitle')}
            </Typography>
            <Box height={isLarge ? '48px' : '40px'} />
            <LoadingButton
                loading={buttonLoading}
                variant="contained"
                color="error"
                onClick={(): void => {
                    if (selectedFolder !== undefined && selectedFolder!.id) {
                        setButtonLoading(true);
                        deleteDocumentFolder(selectedFolder)
                            .then(() => {
                                if (_isMounted) {
                                    setButtonLoading(false);
                                }
                                setDeleteFolderModal(false);
                                setFolders(
                                    folders.filter((folder) => folder.id !== selectedFolder!.id)
                                );
                                setDeleteFolderSuccess(true);
                                setTimeout((): void => {
                                    if (isMounted) {
                                        setDeleteFolderSuccess(false);
                                    }
                                }, 3000);
                            })
                            .catch(() => {
                                if (_isMounted) {
                                    setButtonLoading(false);
                                }
                            });
                    }
                }}>
                {t('remove')}
            </LoadingButton>
            <Box height={isLarge ? '20px' : '12px'} />
            <Button variant="outlined" onClick={(): void => setDeleteFolderModal(false)}>
                {t('cancelButtonTitle')}
            </Button>
        </Stack>
    );
};
