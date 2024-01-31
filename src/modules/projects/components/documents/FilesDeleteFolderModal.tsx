import { LoadingButton } from '@mui/lab';
import { Stack, Typography, Button, useMediaQuery, useTheme, Box } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMounted } from '../../../../components/Hooks/useIsMounted';
import { DocumentFolder } from '../../models/DocumentFolder';
import { deleteDocumentFolder } from '../../services/DocumentsService';

interface RenderDeleteFolderModalProps {
    mainFolder: undefined | DocumentFolder;
    setDeleteFolderModal: Function;
    setDeleteFolderSuccess: Function;
    type: 'ARTISAN' | 'CLIENT';
}

export const RenderDeleteFolderModal = ({
    mainFolder,
    setDeleteFolderModal,
    setDeleteFolderSuccess,
    type
}: RenderDeleteFolderModalProps): React.ReactElement => {
    const [buttonLoading, setButtonLoading] = useState(false);
    const _isMounted = useIsMounted();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const navigate = useNavigate();
    const { id } = useParams();

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
                    if (mainFolder !== undefined) {
                        setButtonLoading(true);
                        deleteDocumentFolder(mainFolder)
                            .then(() => {
                                if (_isMounted) {
                                    setButtonLoading(false);
                                }
                                setDeleteFolderModal(false);
                                setDeleteFolderSuccess(true);
                                setTimeout((): void => {
                                    type === 'ARTISAN'
                                        ? navigate(`/project/documents/craftsman/${id}`)
                                        : navigate(`/project/documents/client/${id}`);
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
