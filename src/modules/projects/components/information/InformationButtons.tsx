import React, { useContext, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProject } from '../../services/ProjectService';
import { CreateProjectForms } from '../../pages/CreateProjectForm';
import { ModalContainer } from '../../../../components/ModalContainer';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { Alert } from '../../../../components/alerts/Alert';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { getUserAccessByProjectId, removeAccess } from '../../services/UserAccessService';
import { UserContext } from '../../../../provider/UserProvider';

export function InformationButtons(): React.ReactElement {
    const { t } = useTranslation();
    const { id } = useParams();
    const projectContext = useContext(ProjectContext);
    const project = projectContext.project;
    const navigate = useNavigate();
    const currentUser = useContext(UserContext);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);
    const [deleteProjectSuccess, setDeleteProjectSuccess] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        projectContext?.refreshData();
    };

    const openDeleteSuccessModal = (): void => {
        setOpenDeleteAlert(false);
        setDeleteProjectSuccess(true);
        setTimeout(async () => {
            setDeleteProjectSuccess(false);
            navigate('/projects/current', { replace: true });
        }, 3000);
    };

    const handleDelete = async (): Promise<void> => {
        if (id) {
            const projectResponse = await deleteProject(id);
            const res = await getUserAccessByProjectId(
                id,
                currentUser.user!.enterprises.at(0)!.enterprise_id.id
            );
            for (const ele of res) {
                await removeAccess(ele.id);
            }
            setOpenDeleteAlert(false);
            if (projectResponse) {
                openDeleteSuccessModal();
            }
        }
    };

    const renderProjectForm = (): React.ReactElement => {
        return (
            <CreateProjectForms
                project={project}
                handleCloseForm={(): void => setOpenProjectForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    return (
        <Box display={'flex'}>
            <Button
                variant={'outlined'}
                color={'secondary'}
                onClick={(): void => setOpenProjectForm(true)}>
                {t('modifyButtonTitle')}
            </Button>
            <Box width={'20px'} />
            <Button
                variant={'outlined'}
                color={'error'}
                onClick={(): void => setOpenDeleteAlert(true)}>
                {t('deleteButtonTitle')}
            </Button>
            <Alert
                width="440px"
                title={t('wantToDeleteProject')}
                subtitle={t('projectDeleteDisclaimer')}
                open={openDeleteAlert}
                onClick={(): Promise<void> => handleDelete()}
                onSecondaryButtonClick={(): void => {
                    setOpenDeleteAlert(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
                secondaryButtonType={'text'}
            />
            <ModalContainer
                isModalOpen={openProjectForm}
                content={renderProjectForm()}
                onClose={(): void => setOpenProjectForm(false)}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={deleteProjectSuccess}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToProjectsCreated')}
            />
        </Box>
    );
}
