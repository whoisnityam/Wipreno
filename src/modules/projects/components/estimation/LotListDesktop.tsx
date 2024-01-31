import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { ChevronDown, ChevronUp, Edit3 } from 'react-feather';
import { LotDetails } from './LotDetails';
import { Lot, LotData } from '../../models/Lot';
import { Alert } from '../../../../components/alerts/Alert';
import { deleteLot, modifyLot, updateLotOrder } from '../../services/LotService';
import { useTranslation } from 'react-i18next';

interface LotListDesktopProps {
    lotList: Lot[];
    setLotList: React.Dispatch<React.SetStateAction<Lot[]>>;
}

export function LotListDesktop({ lotList, setLotList }: LotListDesktopProps): React.ReactElement {
    const theme = useTheme();
    const { t } = useTranslation();
    const [selectedLotId, setSelectedLotId] = useState('');
    const [selectedLotTitle, setSelectedLotTitle] = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [isModifyModalOpen, setIsModifyModalOpen] = React.useState(false);
    const [dataOnLoad, setDataOnLoad] = useState<LotData[]>([]);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    function compare(a: Lot, b: Lot): number {
        if (a.priority! < b.priority!) {
            return -1;
        }
        if (a.priority! > b.priority!) {
            return 1;
        }
        return 0;
    }

    if (lotList && lotList.length > 0) {
        lotList.sort(compare);
    }

    const UpdateOrder = (updatedLotList?: Lot[]): void => {
        const currentLotList = updatedLotList ?? lotList;
        if (currentLotList && currentLotList.length > 0) {
            const List: Lot[] = currentLotList.map((element, index) => {
                element.priority = index + 1;
                return element;
            });
            setLotList(List);

            updateLotOrder(lotList.map((item) => item.id));
        }
    };

    const DeleteLot = async (): Promise<void> => {
        await deleteLot(selectedLotId);
        const filteredList = lotList.filter((item) => item.id !== selectedLotId);
        setDeleteModal(false);
        const filterData = dataOnLoad.filter((singleData) => {
            if (singleData.lotId !== selectedLotId) {
                return singleData;
            }
        });
        setDataOnLoad(filterData);
        UpdateOrder(filteredList);
    };

    const shiftLotUP = (row: Lot, index: number): void => {
        if (index <= 0) {
            return;
        } else {
            const exchange_data = lotList![index - 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;

            lotList![index - 1] = row;
            lotList![index] = exchange_data;
            UpdateOrder(lotList);
        }
    };

    const shiftLotDown = (row: Lot, index: number): void => {
        if (index >= lotList!.length - 1) {
            return;
        } else {
            const exchange_data = lotList![index + 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;
            lotList![index + 1] = row;
            lotList![index] = exchange_data;
            UpdateOrder(lotList);
        }
    };

    const handleModify = (value: string): void => {
        setSelectedLotTitle(value);
    };
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };
    return (
        <>
            {lotList.length > 0 ? (
                lotList.map((lot, index) => {
                    return (
                        <Box key={index} sx={{ marginTop: '60px' }}>
                            <Stack direction="row" sx={{ marginBottom: '16px' }}>
                                <Stack direction={'column'}>
                                    <Stack direction="row">
                                        <Typography variant={'subtitle1'} color={NEUTRAL.darker}>
                                            {lot.title}
                                        </Typography>
                                        <Typography
                                            variant={'body2'}
                                            sx={{ fontWeight: '700px', margin: 'auto' }}
                                            color={NEUTRAL.medium}>
                                            {' '}
                                            ({lot.estimation_tasks?.length ?? 0})
                                        </Typography>
                                        <Stack
                                            spacing={1}
                                            sx={{
                                                paddingLeft: '19px'
                                            }}
                                            onClick={(): void => {
                                                setSelectedLotId(lot.id);
                                                setSelectedLotTitle(lot.title);
                                            }}
                                            direction="row">
                                            <Button
                                                sx={{
                                                    color: theme.palette.secondary.main,
                                                    padding: '0',
                                                    minWidth: '0',
                                                    height: 'fit-content'
                                                }}
                                                onClick={handleClick}
                                                id="basic-button"
                                                aria-controls={open ? 'basic-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={open ? 'true' : undefined}>
                                                <Edit3 />
                                            </Button>
                                            <Button
                                                sx={{
                                                    padding: '0',
                                                    minWidth: '0',
                                                    height: 'fit-content'
                                                }}
                                                onClick={(): void => {
                                                    shiftLotUP(lot, index);
                                                }}>
                                                <ChevronUp />
                                            </Button>
                                            <Button
                                                sx={{
                                                    padding: '0',
                                                    minWidth: '0',
                                                    height: 'fit-content'
                                                }}
                                                onClick={(): void => {
                                                    shiftLotDown(lot, index);
                                                }}>
                                                <ChevronDown />
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>
                            <LotDetails
                                key={lot.id}
                                lot={lot}
                                onDataLoad={(updatedLot: Lot): void => {
                                    setLotList(
                                        lotList
                                            .map((item) => {
                                                if (item.id === lot.id) {
                                                    return updatedLot;
                                                } else {
                                                    return item;
                                                }
                                            })
                                            .slice()
                                    );
                                }}
                            />
                        </Box>
                    );
                })
            ) : (
                <></>
            )}
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button'
                }}>
                <MenuItem
                    onClick={(): void => {
                        setAnchorEl(null);
                        setIsModifyModalOpen(true);
                    }}>
                    <Typography color={NEUTRAL.medium}>{t('modifyButtonTitle')}</Typography>
                </MenuItem>
                <MenuItem
                    onClick={(): void => {
                        setAnchorEl(null);
                        setDeleteModal(true);
                    }}>
                    <Typography color={theme.palette.error.main}>{t('remove')}</Typography>
                </MenuItem>
            </Menu>
            <Alert
                width="440px"
                height="392px"
                title={t('doYouWantToDeleteLot')}
                subtitle={t('deleteLotDescription')}
                open={deleteModal}
                onClick={DeleteLot}
                onClose={(): void => setDeleteModal(false)}
                onSecondaryButtonClick={(): void => {
                    setDeleteModal(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('toCancel')}
            />
            <Alert
                width="440px"
                height="426px"
                title={t('modifyLot')}
                subtitle={t('modifyLotDescription')}
                open={isModifyModalOpen}
                onClick={async (): Promise<void> => {
                    setIsModifyModalOpen(false);
                    try {
                        await modifyLot(selectedLotId, selectedLotTitle);

                        for (const lot of lotList) {
                            if (lot.id === selectedLotId) {
                                lot.title = selectedLotTitle;
                                break;
                            }
                        }
                        setLotList([...lotList]);
                    } catch (e) {
                        console.log(e);
                    }
                }}
                onClose={(): void => setIsModifyModalOpen(false)}
                onSecondaryButtonClick={(): void => {
                    setIsModifyModalOpen(false);
                }}
                primaryButton={t('modifyButtonTitle')}
                primaryButtonType="primary"
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={selectedLotTitle}
                        onChange={(e): void => {
                            handleModify(e.target.value);
                        }}
                        label={t('lotNameLabel')}
                    />
                </>
            </Alert>
        </>
    );
}
