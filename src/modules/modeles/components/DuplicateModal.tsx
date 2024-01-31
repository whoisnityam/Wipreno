import { LoadingButton } from '@mui/lab';
import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../components/ModalContainer';
import { UserContext } from '../../../provider/UserProvider';
import { Lot } from '../../projects/models/Lot';
import { Notice } from '../../projects/models/Notice';
import { PlanningTask } from '../../projects/models/Task';
import { DependentTaskData } from '../models/DependentTaskData';
import {
    createDependentTasks,
    createNoticeLotsTasks,
    getLotsByNoticeId,
    getMyModels
} from '../services/ModelesServices';

interface DuplicateModalProps {
    notice: Notice;
    isModalOpen: boolean;
    onClose: Function;
    setSuccessOpen?: Function;
    isProjectNotice?: boolean;
}

export function DuplicateModal({
    notice,
    isModalOpen,
    onClose,
    setSuccessOpen = (): void => {},
    isProjectNotice
}: DuplicateModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [lots, setLots] = useState<Lot[]>();
    const user = useContext(UserContext);
    const [newNotice, setNewNotice] = useState<Notice>();
    const [taskRelation, setTaskRelation] = useState<{ [orignalTask: string]: string }>();
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [noticeNames, setNoticeName] = useState<string[]>([]);
    const mountedRef = useRef(true);

    const fetchPredefinedNotices = useCallback(async () => {
        const list = await getMyModels(user.user!.enterprises.at(0)!.enterprise_id.id);
        if (!mountedRef.current) return null;
        setNotices(list);
    }, []);

    const fetchNoticeNames = (): void => {
        if (notices.length > 0) {
            const list: string[] = [];
            let i = 0;
            notices.forEach((myModel) => {
                list.push(myModel.title);
                i++;
            });
            if (i === notices.length) {
                setNoticeName([...list]);
            }
        }
    };

    useEffect(() => {
        fetchPredefinedNotices();
        return (): void => {
            mountedRef.current = false;
        };
    }, [isModalOpen]);

    useEffect(() => {
        fetchNoticeNames();
        return (): void => {
            mountedRef.current = false;
        };
    }, [notices]);

    useEffect(() => {
        if (user) {
            fetchPredefinedNotices();
        }
    }, [user]);

    useEffect(() => {
        if (
            taskRelation !== undefined &&
            lots !== undefined &&
            newNotice !== undefined &&
            newNotice.lots !== undefined &&
            newNotice.lots.length === lots.length
        ) {
            const dependentTaskDataArray: DependentTaskData[] = [];
            lots.map((lot) => {
                if (lot.planning_tasks !== undefined) {
                    lot.planning_tasks.map((task) => {
                        if (task.dependencies !== undefined) {
                            task.dependencies.map((dependent) => {
                                dependentTaskDataArray.push({
                                    mainTaskId: taskRelation[task.id],
                                    taskId: taskRelation[dependent.task_id.id]
                                });
                            });
                        }
                    });
                }
            });
            if (dependentTaskDataArray.length > 0) {
                createDependentTasks(dependentTaskDataArray)
                    .then(() => {
                        setSuccessOpen();
                    })
                    .catch(() => {
                        onClose();
                    });
            } else {
                setSuccessOpen();
            }
        }
    }, [taskRelation]);

    useEffect(() => {
        if (
            lots !== undefined &&
            newNotice !== undefined &&
            newNotice.lots !== undefined &&
            newNotice.lots.length === lots.length
        ) {
            const tempTaskRelation: { [orignalTask: string]: string } = {};
            let selectedLot: Lot | undefined;
            let selectedTask: PlanningTask | undefined;
            lots.map((lot) => {
                selectedLot = newNotice.lots!.find((newLot) => newLot.title === lot.title);
                if (
                    selectedLot !== undefined &&
                    lot.planning_tasks !== undefined &&
                    selectedLot.planning_tasks !== undefined
                ) {
                    lot.planning_tasks.map((task) => {
                        selectedTask = selectedLot!.planning_tasks!.find(
                            (newTask) => newTask.title === task.title
                        );
                        if (selectedTask !== undefined) {
                            tempTaskRelation[task.id] = selectedTask.id;
                        }
                    });
                }
            });
            if (Object.keys(tempTaskRelation).length === 0) {
                setSuccessOpen();
            }
            setTaskRelation(tempTaskRelation);
        }
    }, [newNotice, lots]);

    const onDuplicateButtonClick = (): void => {
        setLoading(true);
        getLotsByNoticeId(notice.id)
            .then((lotsData) => {
                if (noticeNames.includes(`copie ${notice.title}`)) {
                    const numOfSameName = noticeNames.filter((noticeItem) =>
                        noticeItem.includes(notice.title)
                    ).length;
                    createNoticeLotsTasks(`copie ${notice.title} (${numOfSameName - 1})`, lotsData)
                        .then((noticeData) => {
                            setNewNotice(noticeData);
                            if (
                                !noticeData.lots ||
                                (noticeData.lots && noticeData.lots.length === 0)
                            ) {
                                setSuccessOpen();
                            }
                        })
                        .catch(() => {
                            onClose();
                        });
                    setLots(lotsData);
                } else {
                    createNoticeLotsTasks(`copie ${notice.title}`, lotsData)
                        .then((noticeData) => {
                            setNewNotice(noticeData);
                            if (
                                !noticeData.lots ||
                                (noticeData.lots && noticeData.lots.length === 0)
                            ) {
                                setSuccessOpen();
                            }
                        })
                        .catch(() => {
                            onClose();
                        });
                    setLots(lotsData);
                }
            })
            .catch(() => {
                onClose();
            });
        setLoading(false);
    };

    const renderDuplicateModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography variant="h4" textAlign="center">
                    {isProjectNotice ? t('duplicateNotice') : t('duplicateTitle')}
                </Typography>
                <Box height="24px" />
                <Typography variant="body1" textAlign="center">
                    {isProjectNotice ? t('duplicateNoticeSubtitle') : t('duplicateSubtitle')}
                </Typography>
                <Box height="48px" />
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    onClick={async (): Promise<void> => onDuplicateButtonClick()}>
                    {t('duplicateButtonTitle')}
                </LoadingButton>
                <Box height="20px" />
                <Button variant="outlined" onClick={(): void => onClose()}>
                    {t('return')}
                </Button>
            </Stack>
        );
    };
    return (
        <ModalContainer
            isModalOpen={isModalOpen}
            onClose={(): void => onClose()}
            content={renderDuplicateModal()}
        />
    );
}
