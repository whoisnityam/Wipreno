import { Box, Button, Typography } from '@mui/material';
import { NEUTRAL } from '../../theme/palette';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProjectForms } from '../../modules/projects/pages/CreateProjectForm';
import { ModalContainer } from '../ModalContainer';
import { SuccessAlert } from '../alerts/SuccessAlert';

interface EmptyStateProjectProps {
    prepareData?: Function;
}

export function ProjectEmptyState({ prepareData }: EmptyStateProjectProps): React.ReactElement {
    const { t } = useTranslation();
    const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            if (prepareData) {
                prepareData();
            }
        }, 3000);
    };

    const renderProjectForm = (): React.ReactElement => {
        return (
            <CreateProjectForms
                handleCloseForm={(): void => setOpenProjectForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                textAlign: 'center'
            }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant={'h3'} color={NEUTRAL.light}>
                    {t('projectEmptyStateTitle')}
                </Typography>
                <Box height={'24px'} />
                <Typography variant={'body1'} color={NEUTRAL.medium}>
                    {t('projectEmptyStateSubtitle')}
                </Typography>
            </Box>
            <Button
                variant={'contained'}
                color={'primary'}
                onClick={(): void => setOpenProjectForm(true)}>
                {t('createProjectButton')}
            </Button>
            <ModalContainer
                isModalOpen={openProjectForm && !successModalOpen}
                content={renderProjectForm()}
                onClose={(): void => setOpenProjectForm(false)}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('projectHasBeenCreated')}
                subtitle={t('youWillBeRedirectedToProjectsCreated')}
            />
        </Box>
    );
}
