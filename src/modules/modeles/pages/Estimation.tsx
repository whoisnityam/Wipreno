import { Box, Button, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getLotsByNoticeId } from '../services/ModelesServices';
import { Lot } from '../../projects/models/Lot';
import { Plus } from 'react-feather';
import { RenderLotTables } from '../components/RenderLotTables';
import { Alert } from '../../../components/alerts/Alert';
import { createLot, updateLotOrder } from '../../projects/services/LotService';
import { EmptyState } from '../../../components/emptyState/EmptyState';

interface EstimationProps {
    isEditable: boolean;
}
export function Estimation({ isEditable }: EstimationProps): React.ReactElement {
    const { t } = useTranslation();
    const { id } = useParams();
    const [title, setTitle] = React.useState('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [lots, setLots] = useState<Lot[]>([]);
    const [isChanged, setIsChanged] = useState(false);

    const fetchDetails = async (): Promise<void> => {
        setLoading(true);
        const receivedLots = await getLotsByNoticeId(id!);
        setLots(receivedLots);
        setLoading(false);
    };

    useEffect(() => {
        const isEmpty = title === '';

        if (!isEmpty) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    }, [title]);

    useEffect(() => {
        fetchDetails();
    }, []);

    function handleModalClose(): void {
        setTitle('');
    }

    const UpdateOrder = (updatedLotList?: Lot[]): void => {
        const currentLotList = updatedLotList ?? lots;
        if (currentLotList && currentLotList.length > 0) {
            const List: Lot[] = currentLotList.map((element, index) => {
                element.priority = index + 1;
                return element;
            });
            setLots(List);

            updateLotOrder(lots.map((item) => item.id));
        }
    };

    const shiftLotUP = (row: Lot, index: number): void => {
        if (index <= 0) {
            return;
        } else {
            const exchange_data = lots![index - 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;

            lots![index - 1] = row;
            lots![index] = exchange_data;
            UpdateOrder(lots);
        }
    };

    const shiftLotDown = (row: Lot, index: number): void => {
        if (index >= lots!.length - 1) {
            return;
        } else {
            const exchange_data = lots![index + 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;
            lots![index + 1] = row;
            lots![index] = exchange_data;
            UpdateOrder(lots);
        }
    };

    function addLots(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="420px"
                title={t('addLot')}
                subtitle={t('addLotsDescription')}
                open={isModalOpen}
                onClick={async (): Promise<void> => {
                    const lot = await createLot(title.trim(), lots.length + 1, null, id!);
                    setLots([...lots, lot]);
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

    const RenderComponents = (): React.ReactElement => {
        return (
            <Stack marginBottom={'40px'}>
                <Stack>
                    {lots.map((lot, index) => {
                        return (
                            <RenderLotTables
                                onUpButtonClick={(): void => {
                                    shiftLotUP(lot, index);
                                }}
                                onDownButtonClick={(): void => {
                                    shiftLotDown(lot, index);
                                }}
                                isEditable={isEditable}
                                key={lot.id}
                                lot={lot}
                                onLotDelete={(lotId: string): void => {
                                    setLots(lots.filter((item) => item.id !== lotId));
                                }}
                            />
                        );
                    })}

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
                </Stack>

                {addLots()}
            </Stack>
        );
    };

    if (loading) {
        return <LoadingIndicator />;
    } else if (lots.length === 0) {
        return (
            <>
                {EmptyStateComponent()} {isEditable && addLots()}
                {isEditable}
            </>
        );
    } else {
        return <>{RenderComponents()}</>;
    }
}
