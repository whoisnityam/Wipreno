import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography, TextField, Button, useMediaQuery, useTheme } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { useIsMounted } from '../../../../components/Hooks/useIsMounted';
import { NEUTRAL } from '../../../../theme/palette';
import { DocumentFolder } from '../../models/DocumentFolder';
import { modifyDocumentFolderName } from '../../services/DocumentsService';

interface RenderModifyFolderNameModalProps {
    mainFolder: DocumentFolder | undefined;
    folderList: DocumentFolder[] | undefined;
    isMounted: boolean;
    setModifyFolderNameModal: Function;
    setModifyFolderNameSuccess: Function;
    setNewFolderNameMain: Function;
}

export const RenderModifyFolderNameModal = ({
    mainFolder,
    folderList,
    isMounted,
    setModifyFolderNameModal,
    setModifyFolderNameSuccess,
    setNewFolderNameMain
}: RenderModifyFolderNameModalProps): React.ReactElement => {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    if (mainFolder && folderList) {
        const [newFolderName, setNewFolderName] = useState<string>(mainFolder.name);
        const [buttonLoading, setButtonLoading] = useState(false);
        const _isMounted = useIsMounted();

        return (
            <Stack justifyContent={isLarge ? 'normal' : 'space-between'} minHeight="100%">
                <Stack>
                    <Typography
                        variant={isLarge ? 'h4' : 'h5'}
                        textAlign="center"
                        color={NEUTRAL.darker}>
                        {t('modifyFolderName')}
                    </Typography>
                    <Box height={isLarge ? '32px' : '40px'} />
                    <TextField
                        fullWidth
                        value={newFolderName}
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
                        disabled={!(Boolean(newFolderName) && newFolderName !== mainFolder.name)}
                        onClick={(): void => {
                            setButtonLoading(true);
                            modifyDocumentFolderName(mainFolder.id, newFolderName)
                                .then(() => {
                                    setNewFolderNameMain(newFolderName);
                                    setModifyFolderNameModal(false);
                                    setModifyFolderNameSuccess(true);
                                    if (_isMounted) {
                                        setButtonLoading(false);
                                    }
                                    setTimeout((): void => {
                                        if (isMounted) {
                                            setModifyFolderNameSuccess(false);
                                        }
                                    }, 3000);
                                })
                                .catch(() => {
                                    if (_isMounted) {
                                        setButtonLoading(false);
                                    }
                                });
                        }}>
                        {t('modifyButtonTitle')}
                    </LoadingButton>
                    <Box height={isLarge ? '20px' : '12px'} />
                    <Button
                        variant="outlined"
                        onClick={(): void => setModifyFolderNameModal(false)}>
                        {t('return')}
                    </Button>
                </Stack>
            </Stack>
        );
    }
    return <></>;
};
