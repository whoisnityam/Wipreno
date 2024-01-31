import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { NEUTRAL } from '../../../theme/palette';
import { Filter } from '../../projects/components/Filter';
import { PlanningView } from '../../projects/components/planning/PlanningView';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createLot, getLots } from '../../projects/services/LotService';
import { Lot } from '../../projects/models/Lot';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { Plus } from 'react-feather';

interface PlanningProps {
    isEditable: boolean;
}

export function Planning({ isEditable }: PlanningProps): React.ReactElement {
    const { id } = useParams();
    const { t } = useTranslation();
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [duration, setDuration] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [title, setTitle] = React.useState('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [isLotCreated, setIsLotCreated] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    const fetchDetails = async (): Promise<void> => {
        setLoading(true);
        const receivedLots = await getLots(id!);
        setLots(receivedLots);
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [isLotCreated]);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            setIsLotCreated(!isLotCreated);
        }, 3000);
    };
    useEffect(() => {
        const isEmpty = title === '';

        if (!isEmpty) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    }, [title]);

    const DurationFilter = (): React.ReactElement => {
        return (
            <Box display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('durationFilterLabel')}
                </Typography>
                <Filter
                    selected={duration}
                    onChange={(value: 'WEEK' | 'MONTH' | 'YEAR'): void => setDuration(value)}>
                    <MenuItem value={'WEEK'}>{t('week')}</MenuItem>
                    <MenuItem value={'MONTH'}>{t('month')}</MenuItem>
                    <MenuItem value={'YEAR'}>{t('year')}</MenuItem>
                </Filter>
            </Box>
        );
    };
    function handleModalClose(): void {
        setTitle('');
    }

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {
                    setIsLotCreated(!isLotCreated);
                }}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToNoticePredefined')}
            />
        );
    }

    function addLots(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="420px"
                title={t('addLot')}
                subtitle={t('addLotsDescription')}
                open={isModalOpen}
                onClick={async (): Promise<void> => {
                    try {
                        await createLot(title.trim(), lots.length + 1, null, id!);

                        openSuccessModal();
                    } catch (e) {
                        console.log(e);
                    }
                    handleModalClose();
                    setIsModalOpen(false);
                }}
                onClose={(): void => {
                    setIsModalOpen(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    handleModalClose();
                    setIsModalOpen(false);
                }}
                primaryButton={t('add')}
                primaryButtonType="primary"
                primaryButtonEnabled={isChanged}
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('lotNameLabel')}
                    />
                </>
            </Alert>
        );
    }

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <Stack marginTop={'81px'}>
                <EmptyState
                    title={''}
                    subtitle={t('estimationEmptyStateTitle')}
                    description={isEditable ? t('estimationEmptyStateSubTitle') : ''}
                    buttonTitle={isEditable ? t('addLot') : undefined}
                    buttonType={'contained'}
                    buttonOnClick={(): void => {
                        setIsModalOpen(true);
                    }}
                />
            </Stack>
        );
    };
    if (loading) {
        return <LoadingIndicator />;
    } else if (lots.length === 0) {
        return (
            <>
                {EmptyStateComponent()}
                {isEditable && addLots()}
                {isEditable && success()}
            </>
        );
    } else {
        return (
            <Stack spacing={'8px'} width={'100%'} height={'100%'}>
                <Stack>{DurationFilter()}</Stack>

                <PlanningView duration={duration} noticeId={id!} readonly={!isEditable} />

                {isEditable && (
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setIsModalOpen(true);
                        }}
                        sx={{ width: '186px', marginRight: '20px' }}>
                        <Plus /> <Box sx={{ width: '10px' }}></Box>
                        {t('addLot')}
                    </Button>
                )}
                {addLots()}
                {success()}
            </Stack>
        );
    }
}
