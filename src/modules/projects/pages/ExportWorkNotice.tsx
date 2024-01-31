import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ExportWorkNoticeForm } from '../components/estimation/ExportWorkNoticeForm';
import { ModalContainer } from '../../../components/ModalContainer';
import { ExportNoticeCustomData } from '../components/estimation/ExportNoticeCustomData';
import { useParams } from 'react-router-dom';
import { Lot } from '../models/Lot';
import { UserContext } from '../../../provider/UserProvider';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { getLots } from '../services/LotService';

interface ExportWorkNoticeProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
}

export function ExportWorkNotice({ handleCloseForm }: ExportWorkNoticeProps): React.ReactElement {
    const { id } = useParams();
    const user = useContext(UserContext);
    const projectContext = useContext(ProjectContext);
    const [selectedChoice, setSelectedChoice] = useState<string>('');
    const [customExportOpen, setCustomExportOpen] = useState<boolean>(false);
    const [lotList, setLotList] = useState<Lot[]>([]);

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

    const CurrentForm = (): React.ReactElement => {
        return (
            <ExportWorkNoticeForm
                initialValues={{
                    selectedOption: selectedChoice
                }}
                onSubmit={(data: { selectedOption: string }): void => {
                    setSelectedChoice(data.selectedOption);
                    setCustomExportOpen(true);
                }}
                closeForm={handleCloseForm}
            />
        );
    };

    const exportCustomData = (): React.ReactElement => {
        return (
            <ExportNoticeCustomData
                lots={lotList}
                companyLogo={user.user?.enterprises.at(0)?.enterprise_id?.image?.id ?? ''}
                userInfo={user.user!}
                clientInfo={projectContext.project?.client_id ?? undefined}
                project={projectContext.project}
                selectedChoice={selectedChoice}
            />
        );
    };

    return (
        <Box>
            <CurrentForm />
            <ModalContainer
                isModalOpen={customExportOpen}
                onClose={(): void => setCustomExportOpen(false)}
                content={exportCustomData()}
                height={'90%'}
                width={'90%'}
            />
        </Box>
    );
}
