import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Typography, IconButton, Stack } from '@mui/material';
import { ModalContainer } from '../../../../components/ModalContainer';
import { X } from 'react-feather';

interface AddModalProps {
    isModalOpen: boolean;
    title: string;
    subtitle: string;
    newUserbuttonText: string;
    createNewUserFunction: Function;
    existingUserbuttonText: string;
    extistingUserFunction: Function;
    onClose: Function;
    onCrossClick?: () => void;
}

export function AddUserModal({
    isModalOpen,
    title,
    subtitle,
    newUserbuttonText,
    createNewUserFunction,
    existingUserbuttonText,
    extistingUserFunction,
    onClose,
    onCrossClick = (): void => {
        onClose();
    }
}: AddModalProps): React.ReactElement {
    const renderAddModal = (): React.ReactElement => {
        return (
            <Box display="flex" flexDirection="column" textAlign="center">
                <Stack alignItems={'flex-end'}>
                    <IconButton>
                        <X
                            style={{ objectFit: 'contain' }}
                            onClick={(): void => {
                                onCrossClick();
                            }}
                        />
                    </IconButton>
                </Stack>
                <Typography variant="h4">{title}</Typography>
                <Box height="24px" />
                <Typography variant="body1">{subtitle}</Typography>
                <Box height="48px" />
                <Button variant="contained" onClick={(): void => createNewUserFunction()}>
                    {newUserbuttonText}
                </Button>
                <Box height="20px" />
                <Button
                    color={'secondary'}
                    variant="contained"
                    onClick={(): void => extistingUserFunction()}>
                    {existingUserbuttonText}
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
