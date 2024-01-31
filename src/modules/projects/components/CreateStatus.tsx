import { TextField } from '@mui/material';
import { Alert } from '../../../components/alerts/Alert';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createStatus } from '../services/StatusService';
import { UserContext } from '../../../provider/UserProvider';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { ProjectStatus as StatusInterface } from '../models/ProjectStatus';

interface CreateStatusProps {
    nextPriority: number;
    isOpen: boolean;
    statusList: StatusInterface[];
    onClose?: Function;
}

export function CreateStatus({
    nextPriority,
    isOpen,
    onClose = (): void => {},
    statusList
}: CreateStatusProps): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const [modalOpen, setModalOpen] = useState(isOpen);
    const [name, setName] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [statusNameList, setStatusNameList] = useState<string[]>([]);

    useEffect(() => {
        const list: string[] = [];
        let i = 0;
        statusList.forEach((status) => {
            i++;
            list.push(status.name);
        });
        if (i === statusList.length) {
            setStatusNameList([...list]);
        }
    }, [statusList]);

    const createNewStatus = useCallback(async () => {
        createStatus(name, nextPriority, user.user!.enterprises.at(0)!.enterprise_id.id).then(
            (status) => {
                setModalOpen(false);
                setSuccessModalOpen(true);
                setTimeout(() => {
                    onClose(status);
                }, 2000);
            }
        );
    }, [name]);

    return (
        <>
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                buttonEnabled={false}
                button=""
                title={t('yourRequestBeenAccounted')}
                subtitle={t('youWillBeRedirectedToProjects')}
            />
            <Alert
                width="440px"
                height="410px"
                title={t('createAStatus')}
                subtitle={t('createNewProgressStatus')}
                primaryButton={t('createStatus')}
                onClick={async (): Promise<void> => {
                    if (name.trim()) {
                        createNewStatus();
                    }
                }}
                secondaryButton={t('return')}
                onSecondaryButtonClick={(): void => {
                    onClose();
                }}
                open={modalOpen}
                primaryButtonEnabled={name.trim() !== '' && !statusNameList.includes(name.trim())}
                onClose={(): void => onClose()}>
                <TextField
                    fullWidth
                    id={'status'}
                    name={'status'}
                    value={name}
                    onChange={(event): void => setName(event.target.value)}
                    placeholder={t('progressStatus')}
                    label={t('progressStatus')}
                    error={statusNameList.includes(name.trim())}
                    helperText={statusNameList.includes(name.trim()) ? t('enterUniqueStatus') : ''}
                />
            </Alert>
        </>
    );
}
