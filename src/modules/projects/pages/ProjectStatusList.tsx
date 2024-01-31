import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../provider/UserProvider';
import { ProjectStatus as StatusInterface } from '../models/ProjectStatus';
import greyUpArrow from '../../../assets/greyUpArrow.svg';
import greyDownArrow from '../../../assets/greyDownArrow.svg';
import { NEUTRAL } from '../../../theme/palette';
import {
    deleteStatus,
    getProjectStatusByEnterpriseId,
    updateStatusOrder
} from '../services/StatusService';
import { Plus } from 'react-feather';
import { Alert } from '../../../components/alerts/Alert';
import { CreateStatus } from '../components/CreateStatus';
import { getProjectsByStatus } from '../services/ProjectService';

export const ProjectStatusList = (): React.ReactElement => {
    const theme = useTheme();
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [cannotDeleteModal, setCannotDeleteModal] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [statusList, setStatusList] = useState<StatusInterface[]>([]);
    const [selectedRow, setSelectedRow] = useState<StatusInterface>({
        id: '',
        name: '',
        is_default_status: false,
        enterprise_id: user.user!.enterprises.at(0)!.enterprise_id.id,
        priority: 1
    });

    useEffect(() => {
        const getData = async (): Promise<void> => {
            const StatusData: StatusInterface[] = await getProjectStatusByEnterpriseId(
                user.user!.enterprises.at(0)!.enterprise_id.id
            );
            setStatusList(StatusData);
        };
        getData();
    }, []);

    function compare(a: StatusInterface, b: StatusInterface): number {
        if (a.priority < b.priority) {
            return -1;
        }
        if (a.priority > b.priority) {
            return 1;
        }
        return 0;
    }

    if (statusList && statusList.length > 0) {
        statusList.sort(compare);
    }

    useEffect(() => {
        if (statusList && statusList.length > 0) {
            for (let i = 1; i <= statusList.length; i++) {
                const List = statusList;
                List[i - 1].priority = i;
                setStatusList(List);
            }
            updateStatusOrder(statusList.map((item) => item.id));
        }
    }, [statusList]);

    const deleteRow = async (): Promise<void> => {
        const projectsBystatus = await getProjectsByStatus(
            selectedRow.name,
            user.user!.enterprises.at(0)!.enterprise_id.id
        );
        if (projectsBystatus.length > 0) {
            setDeleteModal(false);
            setCannotDeleteModal(true);
        } else {
            await deleteStatus(selectedRow.id);
            const filteredList = statusList.filter((item) => item.id !== selectedRow.id);
            setStatusList(filteredList);
            setDeleteModal(false);
        }
    };

    const shiftRowUP = (row: StatusInterface, index: number): void => {
        if (index <= 0) {
            return;
        } else {
            const exchange_data = statusList![index - 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;

            statusList![index] = row;
            statusList![index - 1] = exchange_data;
            setStatusList(statusList?.slice());
        }
    };

    const shiftRowDown = (row: StatusInterface, index: number): void => {
        if (index >= statusList!.length - 1) {
            return;
        } else {
            const exchange_data = statusList![index + 1];
            const temp = exchange_data.priority;
            exchange_data.priority = row.priority;
            row.priority = temp;

            statusList![index] = row;
            statusList![index + 1] = exchange_data;
            setStatusList(statusList?.slice());
        }
    };

    const deleteStatusButton = (row: StatusInterface): React.ReactElement => {
        return (
            <Button
                disabled={row.is_default_status}
                variant={'outlined'}
                color={'error'}
                onClick={(): void => {
                    setDeleteModal(true);
                    setSelectedRow(row);
                }}>
                {t('deleteStatus')}
            </Button>
        );
    };

    const getStatusList = (): React.ReactElement | null => {
        return (
            <Table aria-label="project status">
                <TableHead sx={{ padding: '0px !important' }}>
                    <TableRow>
                        <TableCell>{t('priority')}</TableCell>
                        <TableCell>{t('progressStatus')}</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {statusList?.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ verticalAlign: 'inherit !important' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}>
                                    <Box>
                                        <img
                                            src={greyUpArrow}
                                            alt="greyUpArrow"
                                            style={{ width: '20px', height: '20px' }}
                                            onClick={(): void => {
                                                shiftRowUP(row, index);
                                            }}
                                        />
                                        <img
                                            src={greyDownArrow}
                                            alt="greyDownArrow"
                                            style={{ width: '20px', height: '20px' }}
                                            onClick={(): void => {
                                                shiftRowDown(row, index);
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        ml={2}
                                        variant="h6"
                                        color={NEUTRAL.medium}
                                        fontWeight={400}>
                                        {t('Position ')}
                                        {index + 1}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align={'right'}>{deleteStatusButton(row)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <Box sx={{ marginBottom: '40px' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                <Typography variant="h2" color={NEUTRAL.darker}>
                    {t('progressStatus')}
                </Typography>
                <Button
                    variant={'outlined'}
                    color={'secondary'}
                    onClick={(): void => setIsModalOpen(true)}
                    startIcon={<Plus />}>
                    {t('createAStatus')}
                </Button>
            </Box>
            <>
                <Box
                    mt={'48px'}
                    sx={{
                        border: `1px solid ${theme.palette.grey[100]}`,
                        borderRadius: '4px'
                    }}>
                    {getStatusList()}
                </Box>
                {isModalOpen ? (
                    <CreateStatus
                        isOpen={isModalOpen}
                        onClose={(value: StatusInterface): void => {
                            if (value) {
                                setStatusList([...statusList, value]);
                            }
                            setIsModalOpen(false);
                        }}
                        nextPriority={
                            statusList ? Math.max(...statusList.map((o) => o.priority)) + 1 : 1
                        }
                        statusList={statusList}
                    />
                ) : (
                    <></>
                )}
                <Alert
                    width="440px"
                    height="392px"
                    title={t('doYouWantToDeleteStatus')}
                    subtitle={t('deleteStatusDescription')}
                    open={deleteModal}
                    onClick={deleteRow}
                    onClose={(): void => setDeleteModal(false)}
                    onSecondaryButtonClick={(): void => {
                        setDeleteModal(false);
                    }}
                    primaryButton={t('remove')}
                    primaryButtonType="error"
                    secondaryButton={t('cancelButtonTitle')}
                />
                <Alert
                    width="440px"
                    height="380px"
                    title={t('cannotDeleteStatus')}
                    subtitle={t('cannotDeleteStatusSubtitle')}
                    open={cannotDeleteModal}
                    onClick={(): void => {
                        setCannotDeleteModal(false);
                    }}
                    onClose={(): void => setCannotDeleteModal(false)}
                    primaryButton={t('toCancel')}
                    primaryButtonType="error"
                />
            </>
        </Box>
    );
};
