import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SystemStyleObject } from '@mui/system';
import { ModalContainer } from '../../../../components/ModalContainer';
import { NEUTRAL } from '../../../../theme/palette';

interface AddModalProps {
    isModalOpen: boolean;
    title: string;
    subtitle: string;
    exportWorkNoticeText: string;
    exportWorkNotice: Function;
    exportMaterialChoices: Function;
    onClose: Function;
}

export function ExportModal({
    isModalOpen,
    title,
    subtitle,
    exportWorkNoticeText,
    exportWorkNotice,
    exportMaterialChoices,
    onClose
}: AddModalProps): React.ReactElement {
    const { t } = useTranslation();
    const themes = useTheme();

    const renderAddModal = (): React.ReactElement => {
        return (
            <Box display="flex" flexDirection="column" textAlign="center">
                <Typography color={NEUTRAL.darker} variant="h4">
                    {title}
                </Typography>
                <Box height="24px" />
                <Typography color={themes.palette.grey[200]} variant="body1">
                    {subtitle}
                </Typography>
                <Box height="48px" />
                <Button variant="contained" onClick={(): void => exportWorkNotice()}>
                    {exportWorkNoticeText}
                </Button>
                <Box height="20px" />
                <Button
                    sx={(theme): SystemStyleObject<Theme> => ({
                        background: theme.palette.secondary.lighter,
                        color: theme.palette.primary.darker,
                        boxShadow: 'none',
                        ':hover': {
                            backgroundColor: theme.palette.secondary.lighter,
                            color: theme.palette.primary.darker
                        }
                    })}
                    variant="contained"
                    onClick={(): void => exportMaterialChoices()}>
                    {t('exportListOfMaterialChoices')}
                </Button>
            </Box>
        );
    };

    return (
        <div>
            <ModalContainer
                sx={{ padding: '40px !important' }}
                isModalOpen={isModalOpen}
                content={renderAddModal()}
                onClose={onClose}
            />
        </div>
    );
}
