import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from './ModalContainer';
import { NEUTRAL } from '../theme/palette';

interface DeleteModalProps {
    isOpen: boolean;
    title: string;
    subtitle: string;
    onDelete: Function;
    onClose: Function;
}

export const DeleteModal = ({
    isOpen,
    title,
    subtitle,
    onClose,
    onDelete
}: DeleteModalProps): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const renderDeleteModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography textAlign="center" variant="h4" color={NEUTRAL.darker}>
                    {title}
                </Typography>
                <Box height="24px" />
                <Typography textAlign="center" variant="body1" color={theme.palette.grey[200]}>
                    {subtitle}
                </Typography>
                <Box height="48px" />
                <Button
                    variant="contained"
                    color="error"
                    onClick={(): void => {
                        onDelete();
                        onClose();
                    }}>
                    {t('remove')}
                </Button>
                <Box height="20px" />
                <Button variant="outlined" onClick={(): void => onClose()}>
                    {t('cancelButtonTitle')}
                </Button>
            </Stack>
        );
    };

    return (
        <ModalContainer
            onClose={(): void => {
                onClose();
            }}
            isModalOpen={isOpen}
            content={renderDeleteModal()}
        />
    );
};
