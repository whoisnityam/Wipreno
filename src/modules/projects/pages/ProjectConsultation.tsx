import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { useParams } from 'react-router-dom';
import { Consultation } from '../models/Consultation';
import { getConsultations } from '../services/ConsultationServices';
import { ConsultationTable } from '../components/consultation/ConsultationTable';
import { Plus } from 'react-feather';
import { ModalContainer } from '../../../components/ModalContainer';
import { CreateConsultationForms } from '../components/consultation/CreateConsultationForm';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';

export function ProjectConsultation(): React.ReactElement {
    const { t } = useTranslation();
    const { id } = useParams();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [openConsultationForm, setOpenConsultationForm] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const mountedRef = useRef(true);

    const fetchConsultations = useCallback(async () => {
        const list = await getConsultations(id!);
        if (!mountedRef.current) return null;
        setConsultations(list);
    }, []);

    useEffect(() => {
        if (id) {
            fetchConsultations();
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, []);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            fetchConsultations();
            setSuccessModalOpen(false);
        }, 3000);
    };

    const renderConsultationForm = (): React.ReactElement => {
        return (
            <CreateConsultationForms
                handleCloseForm={(): void => setOpenConsultationForm(false)}
                handleOpenSuccess={(): void => {
                    openSuccessModal();
                }}
            />
        );
    };

    const ConsultationList = (): React.ReactElement => {
        return (
            <Stack width="100%" height="100%">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant={'h5'}>{t('consultationTabTitle')}</Typography>
                    {isLarge ? (
                        <Button
                            variant={'outlined'}
                            startIcon={<Plus />}
                            onClick={(): void => setOpenConsultationForm(true)}>
                            {t('createConsultation')}
                        </Button>
                    ) : (
                        <></>
                    )}
                </Stack>
                <ConsultationTable consultations={consultations} />
                {isLarge ? (
                    <>
                        <ModalContainer
                            height="auto"
                            isModalOpen={openConsultationForm}
                            content={renderConsultationForm()}
                            onClose={(): void => setOpenConsultationForm(false)}
                        />
                        <SuccessAlert
                            onClose={(): void => {}}
                            open={successModalOpen}
                            title={t('consultationRequestCommunicated')}
                            subtitle={t('emailSentToArtisan')}
                        />
                    </>
                ) : (
                    <></>
                )}
            </Stack>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (consultations.length === 0) {
            return (
                <Box width={'100%'}>
                    {isLarge ? (
                        <>
                            <EmptyState
                                title={''}
                                subtitle={t('consultationEmptyStateTitle')}
                                description={t('consultationEmptyStateDescription')}
                                buttonTitle={t('createConsultation')}
                                buttonType={'contained'}
                                buttonOnClick={(): void => setOpenConsultationForm(true)}
                            />
                            <ModalContainer
                                height="auto"
                                isModalOpen={openConsultationForm}
                                content={renderConsultationForm()}
                                onClose={(): void => setOpenConsultationForm(false)}
                            />
                            <SuccessAlert
                                onClose={(): void => {}}
                                open={successModalOpen}
                                title={t('consultationRequestCommunicated')}
                                subtitle={t('emailSentToArtisan')}
                            />
                        </>
                    ) : (
                        <EmptyState
                            title={''}
                            subtitle={t('consultationEmptyStateTitle')}
                            description={''}
                        />
                    )}
                </Box>
            );
        } else {
            return <ConsultationList />;
        }
    };

    return <RenderComponents />;
}
