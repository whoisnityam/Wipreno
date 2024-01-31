import { LoadingButton } from '@mui/lab';
import { Box, Button, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIsMounted } from '../../../../components/Hooks/useIsMounted';
import { NEUTRAL } from '../../../../theme/palette';
import { DocumentFolder } from '../../models/DocumentFolder';
import { createDocumentFolder } from '../../services/DocumentsService';

interface RenderAddFolderModalProps {
    type: 'ARTISAN' | 'CLIENT';
    folders: DocumentFolder[];
    isMounted: boolean;
    setAddFolderModal: Function;
    setFolders: Function;
    setAddFolderSuccess: Function;
}

export const RenderAddFolderModal = ({
    type,
    isMounted,
    folders,
    setAddFolderModal,
    setFolders,
    setAddFolderSuccess
}: RenderAddFolderModalProps): React.ReactElement => {
    const { id } = useParams();
    const [newFolderName, setNewFolderName] = useState<string>();
    const theme = useTheme();
    const [buttonLoading, setButtonLoading] = useState(false);
    const _isMounted = useIsMounted();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Stack justifyContent={isLarge ? 'normal' : 'space-between'} minHeight="100%">
            <Stack>
                <Typography
                    variant={isLarge ? 'h4' : 'h5'}
                    textAlign="center"
                    color={NEUTRAL.darker}>
                    {t('createFolder')}
                </Typography>
                <Box height={isLarge ? '32px' : '40px'} />
                <TextField
                    fullWidth
                    value={newFolderName ?? ''}
                    onChange={(e): void => setNewFolderName(e.target.value)}
                    required
                    placeholder={t('folderName')}
                    label={t('folderName')}
                />
            </Stack>
            {isLarge && <Box height="48px" />}
            <Stack>
                <LoadingButton
                    loading={buttonLoading}
                    variant="contained"
                    disabled={!Boolean(newFolderName)}
                    onClick={async (): Promise<void> => {
                        if (newFolderName !== undefined && id !== undefined) {
                            setButtonLoading(true);
                            createDocumentFolder(newFolderName, id, type)
                                .then((response) => {
                                    if (_isMounted) {
                                        setButtonLoading(false);
                                        setNewFolderName(undefined);
                                    }
                                    setAddFolderModal(false);
                                    setFolders([...folders, response]);
                                    setAddFolderSuccess(true);
                                    setTimeout((): void => {
                                        if (isMounted) {
                                            setAddFolderSuccess(false);
                                        }
                                    }, 3000);
                                })
                                .catch(() => {
                                    if (_isMounted) {
                                        setButtonLoading(false);
                                        setNewFolderName(undefined);
                                    }
                                });
                        }
                    }}>
                    {t('createNewFolder')}
                </LoadingButton>
                <Box height={isLarge ? '20px' : '12px'} />
                <Button variant="outlined" onClick={(): void => setAddFolderModal(false)}>
                    {t('return')}
                </Button>
            </Stack>
        </Stack>
    );
};
