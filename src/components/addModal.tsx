import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Theme, Typography } from '@mui/material';
import { ModalContainer } from './ModalContainer';
import { useTranslation } from 'react-i18next';
import { SystemStyleObject } from '@mui/system';

interface AddModalProps {
    isModalOpen: boolean;
    title: string;
    subtitle: string;
    createButtonText: string;
    createFunction: Function;
    importFunction: Function;
    onClose: Function;
}

export function AddModal({
    isModalOpen,
    title,
    subtitle,
    createButtonText,
    createFunction,
    importFunction,
    onClose
}: AddModalProps): React.ReactElement {
    const { t } = useTranslation();

    const renderAddModal = (): React.ReactElement => {
        return (
            <Box display="flex" flexDirection="column" textAlign="center">
                <Typography variant="h4">{title}</Typography>
                <Box height="24px" />
                <Typography variant="body1">{subtitle}</Typography>
                <Box height="48px" />
                <Button variant="contained" onClick={(): void => createFunction()}>
                    {createButtonText}
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
                    onClick={(): void => importFunction()}>
                    {t('importDatabase')}
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
