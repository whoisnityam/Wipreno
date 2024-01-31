import React, { useState } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PINK } from '../../../../theme/palette';
import { fontWeightSemiBold, small2 } from '../../../../theme/typography';
import { ProjectAccess } from '../../models/ProjectAccess';
import { WRTable } from '../../../../components/WRTable';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { ModalContainer } from '../../../../components/ModalContainer';
import { SaveModifyForm } from './SaveModifyForm';
import { removeAccess } from '../../services/UserAccessService';
import { Role } from '../../../profile/models/Role';

interface TableProps {
    userProjectAccess: ProjectAccess[];
    onDelete?: Function;
    onModify?: Function;
}

export const PinkBox = (item: string): React.ReactElement => {
    return (
        <Box
            sx={{
                background: PINK.lighter,
                width: 'fit-content'
            }}>
            <Typography
                sx={{
                    ...small2,
                    color: PINK.darker,
                    padding: '4px 8px',
                    fontWeight: fontWeightSemiBold,
                    whiteSpace: 'nowrap'
                }}>
                {item}
            </Typography>
        </Box>
    );
};
export const greenBox = (item: string | number): React.ReactElement => {
    const theme = useTheme();
    if (typeof item === 'string') {
        return (
            <Box
                sx={{
                    background: theme.palette.success.light,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: theme.palette.success.dark,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        whiteSpace: 'nowrap'
                    }}>
                    {item}
                </Typography>
            </Box>
        );
    } else {
        return (
            <Box
                sx={{
                    background: theme.palette.success.light,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: theme.palette.success.dark,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        whiteSpace: 'nowrap'
                    }}>
                    {`+`}
                    {item}
                </Typography>
            </Box>
        );
    }
};

export function UserAccessTable({
    userProjectAccess,
    onDelete = (): void => {},
    onModify = (): void => {}
}: TableProps): React.ReactElement {
    const { t } = useTranslation();
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [deletesuccessModalOpen, setDeleteSuccessModalOpen] = useState<boolean>(false);
    const [modifysuccessModalOpen, setModifySuccessModalOpen] = useState<boolean>(false);
    const [openModifyForm, setOpenModifyForm] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<ProjectAccess>();
    let temp: string;
    const openDeleteSuccessModal = (id: string): void => {
        setOpenDeleteAlert(false);
        setDeleteSuccessModalOpen(true);
        setTimeout(async () => {
            setDeleteSuccessModalOpen(false);
            onDelete(id);
        }, 3000);
    };

    const handleDelete = async (): Promise<void> => {
        await removeAccess(selectedUser?.id!);
        temp = selectedUser?.id!;
        openDeleteSuccessModal(selectedUser?.id!);
    };

    const openSuccessModal = (): void => {
        setOpenModifyForm(false);
        setModifySuccessModalOpen(true);
        setTimeout(async () => {
            setModifySuccessModalOpen(false);
        }, 3000);
    };
    const renderModifyForm = (): React.ReactElement => {
        return (
            <SaveModifyForm
                handleCloseForm={(): void => {
                    setOpenModifyForm(false);
                }}
                handleOpenSuccess={(updatedData: ProjectAccess): void => {
                    openSuccessModal();
                    onModify(updatedData, selectedUser?.id);
                }}
                selectedUser={selectedUser}
            />
        );
    };

    const tableHeaders = [
        t('guestName'),
        t('emailFieldLabel'),
        t('typeOfGuest'),
        t('access'),
        '',
        ''
    ];
    const tableBody = userProjectAccess.map((user, index) => {
        const getRole = (): string => {
            const role = user.user_id.role.name;
            if (role === Role.artisan) {
                return t('artisan');
            } else if (role === Role.client) {
                return t('client');
            } else {
                return '';
            }
        };

        const map = new Map();
        if (user.has_discussions) {
            map.set(t('discussion'), t('discussion'));
        }
        if (user.has_documents) {
            map.set(t('documents'), t('documents'));
        }
        if (user.has_planning) {
            map.set(t('planning'), t('planning'));
        }
        if (user.has_reports) {
            map.set(t('reports'), t('reports'));
        }
        const values = Array.from(map.values());
        return [
            <Typography key={index} variant="body2" sx={{ width: '150px' }}>
                {`${user.user_id.first_name} ${user.user_id.last_name}`}
            </Typography>,
            <Typography key={index} variant="body2" sx={{ width: '150px' }}>
                {user.user_id.email}
            </Typography>,
            <Box key={index} display="flex">
                {PinkBox(getRole())}
            </Box>,
            <Stack direction="row" key={index} sx={{ marginRight: '150px', width: '200px' }}>
                {values.length >= 1 && greenBox(values[0])}
                {values.length >= 2 && <Box width="8px" />}
                {values.length >= 2 && greenBox(values[1])}
                {values.length >= 3 && <Box width="8px" />}
                {values.length >= 3 && greenBox(values.length - 2)}
            </Stack>,
            <Button
                key={index}
                variant={'outlined'}
                color={'secondary'}
                fullWidth
                onClick={(): void => {
                    setSelectedUser(user);
                    setOpenModifyForm(true);
                }}
                sx={{ borderRadius: '4px', width: '147px' }}>
                {t('modifyButtonTitle')}
            </Button>,
            <Button
                key={index}
                variant={'outlined'}
                color={'error'}
                fullWidth
                onClick={(): void => {
                    setSelectedUser(user);
                    setOpenDeleteAlert(true);
                }}
                sx={{ borderRadius: '4px', width: '147px' }}>
                {t('deleteButtonTitle')}
            </Button>
        ];
    });
    return (
        <>
            <WRTable headers={tableHeaders} body={tableBody} />
            <Alert
                width="440px"
                title={t('deleteUSerAccessInfoTitle')}
                subtitle={
                    t('deleteUSerAccessInfoSubtitle') +
                    ' ' +
                    `${selectedUser?.user_id.role.name.toLowerCase()}` +
                    ' ' +
                    `${selectedUser?.user_id.first_name}?`
                }
                open={openDeleteAlert}
                onClick={(): Promise<void> => handleDelete()}
                onSecondaryButtonClick={(): void => {
                    setOpenDeleteAlert(false);
                }}
                onClose={(): void => {
                    setOpenDeleteAlert(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('toCancel')}
                secondaryButtonType={'text'}
            />
            <SuccessAlert
                onClose={(): void => {
                    onDelete(temp);
                    setDeleteSuccessModalOpen(false);
                }}
                open={deletesuccessModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('deleteUSerAccessSuccess')}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={modifysuccessModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('modifyUserAccessSuccess')}
            />
            <ModalContainer
                isModalOpen={openModifyForm}
                content={renderModifyForm()}
                onClose={(): void => setOpenModifyForm(false)}
            />
        </>
    );
}
