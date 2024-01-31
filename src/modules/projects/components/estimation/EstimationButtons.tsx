import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { Alert } from '../../../../components/alerts/Alert';
import { deleteNotice } from '../../services/NoticeService';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { UserContext } from '../../../../provider/UserProvider';
import { Lot } from '../../models/Lot';
import { ExportWorkNotice } from '../../pages/ExportWorkNotice';
import { MaterialPdfComponent } from './MaterialPdfComponent';
import { ModalContainer } from '../../../../components/ModalContainer';
import { ExportModal } from './ExportModal';
import { getLots } from '../../services/LotService';

export function EstimationButtons({
    noticeId,
    onReload = (): void => {}
}: {
    noticeId: string;
    onReload: Function;
}): React.ReactElement {
    const user = useContext(UserContext);
    const [deleteModal, setDeleteModal] = useState(false);
    const projectContext = useContext(ProjectContext);
    const [lotList, setLotList] = useState<Lot[]>([]);
    const [openExportEstimationModal, setOpenExportEstimationModal] = useState(false);
    const [openExportWorkNoticeModal, setOpenExportWorkNoticeModal] = useState(false);
    const [deleteSuccessModalOpen, setdeleteSuccessModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [exportByMaterialModal, setExportByMaterialModal] = useState<boolean>(false);
    const { id } = useParams();
    const { t } = useTranslation();

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        onReload();
        setTimeout(async () => {
            setSuccessModalOpen(false);
            projectContext?.refreshData();
        }, 3000);
    };
    const fetchReports = async (): Promise<void> => {
        const project = projectContext.project;
        if (project) {
            const lots = await getLots(project!.notices!.at(0)!.id);
            setLotList([...lots]);
        }
    };

    useEffect(() => {
        if (id) {
            fetchReports();
        }
    }, [id]);

    const openDeleteSuccessModal = (): void => {
        setdeleteSuccessModalOpen(true);
        setTimeout(async () => {
            setdeleteSuccessModalOpen(false);
            projectContext?.refreshData();
        }, 3000);
    };

    const renderExportWorkNotice = (): React.ReactElement => {
        return (
            <ExportWorkNotice
                handleCloseForm={(): void => setOpenExportWorkNoticeModal(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };
    const exportMaterialContent = (): React.ReactElement => {
        return (
            <MaterialPdfComponent
                lots={lotList}
                companyLogo={user.user?.enterprises.at(0)?.enterprise_id?.image?.id ?? ''}
                userInfo={user.user!}
                clientInfo={projectContext.project?.client_id ?? undefined}
                project={projectContext.project}
                hasCompanyHeader={true}
            />
        );
    };

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {}}
                open={deleteSuccessModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToProjects')}
            />
        );
    }

    const DeleteMyModel = async (): Promise<void> => {
        const res = await deleteNotice(noticeId);
        if (res) {
            setDeleteModal(false);
            openDeleteSuccessModal();
        }
    };
    function deleteNoticeModal(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="392px"
                title={t('wantToDeleteNotices')}
                subtitle={t('wantToDeleteNoticesSubtitle')}
                open={deleteModal}
                onClick={DeleteMyModel}
                onClose={(): void => setDeleteModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
            />
        );
    }

    return (
        <Box display={'flex'}>
            <Button
                variant={'contained'}
                color={'secondary'}
                onClick={(): void => {
                    setOpenExportEstimationModal(true);
                    fetchReports();
                }}>
                {t('exportButton')}
            </Button>
            <Box width={'20px'} />
            <Button
                variant={'outlined'}
                color={'error'}
                onClick={(): void => {
                    setDeleteModal(true);
                }}>
                {t('deleteNoticeButtonTitle')}
            </Button>
            <ExportModal
                isModalOpen={openExportEstimationModal}
                title={t('whatYouWantToExport')}
                subtitle={t('whatYouWantToExportSubtitle')}
                exportWorkNoticeText={t('exportTheWorkNotice')}
                exportWorkNotice={(): void => {
                    setOpenExportEstimationModal(false);
                    setOpenExportWorkNoticeModal(true);
                }}
                exportMaterialChoices={(): void => {
                    setOpenExportEstimationModal(false);
                    setExportByMaterialModal(true);
                }}
                onClose={(): void => {
                    setOpenExportEstimationModal(false);
                }}
            />
            <ModalContainer
                isModalOpen={openExportWorkNoticeModal}
                content={renderExportWorkNotice()}
                onClose={(): void => setOpenExportWorkNoticeModal(false)}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('requestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToProjectSheet')}
            />
            <ModalContainer
                isModalOpen={exportByMaterialModal}
                onClose={(): void => setExportByMaterialModal(false)}
                content={exportMaterialContent()}
                height={'90%'}
                width={'90%'}
            />
            {deleteNoticeModal()}
            {success()}
        </Box>
    );
}
