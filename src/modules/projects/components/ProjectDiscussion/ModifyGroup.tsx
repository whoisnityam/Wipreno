import {
    Avatar,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { body3, small2 } from '../../../../theme/typography';
import { getFullName, stringAvatar } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { DiscussionGroup } from '../../models/DiscussionGroup';
import { addUsersToGroup, removeUserFromGroup } from '../../services/DiscussionService';

interface ModifyGroupProps {
    users: User[];
    currentUser: User;
    reload: Function;
    openModal: boolean;
    onClose: Function;
    groupSelected: DiscussionGroup | undefined;
}

export function ModifyGroup({
    openModal,
    users,
    currentUser,
    reload = (): void => {},
    onClose = (): void => {},
    groupSelected
}: ModifyGroupProps): React.ReactElement {
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState<boolean>(false);
    const [addUsersModal, setAddUsersModal] = useState(false);
    const [modifyModalOpen, setModifyModalOpen] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [inviteeList, setInviteeList] = useState<string[]>([]);
    const [idToBeDeleted, setIdToBeDeleted] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<DiscussionGroup>();
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    const theme = useTheme();
    const { t } = useTranslation();
    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            reload();
        }, 3000);
    };

    useEffect(() => {
        const isModified = inviteeList.length > 0;
        setIsChanged(isModified);
    }, [inviteeList]);

    function handleModalClose(): void {
        setInviteeList([]);
        onClose();
    }

    useEffect(() => {
        setSelectedGroup(groupSelected);
    }, [groupSelected]);

    useEffect(() => {
        setModifyModalOpen(openModal);
    }, [openModal]);

    const handleInviteeChange = (event: SelectChangeEvent<typeof inviteeList>): void => {
        const {
            target: { value }
        } = event;
        setInviteeList(typeof value === 'string' ? value.split(',') : value);
    };

    function deleteUser(): React.ReactElement {
        return (
            <Alert
                width="440px"
                title={t('deleteUserTitle')}
                subtitle={t('deleteUserDescription')}
                open={openDeleteUserAlert}
                onClick={async (): Promise<void> => {
                    const filteredUsers = selectedGroup!.users.filter((user) => {
                        if (user.user_id.id !== idToBeDeleted) {
                            return user;
                        }
                    });
                    await removeUserFromGroup(idToBeDeleted);
                    selectedGroup!.users = filteredUsers;
                    setSelectedGroup(selectedGroup);
                    setOpenDeleteUserAlert(false);
                    openSuccessModal();
                }}
                onSecondaryButtonClick={(): void => {
                    setOpenDeleteUserAlert(false);
                }}
                primaryButton={t('deleteUserButton')}
                primaryButtonType="error"
                secondaryButton={t('cancelButtonTitle')}
                secondaryButtonType={'text'}
            />
        );
    }

    function addUsers(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="510px"
                title={t('addMemberTitle')}
                subtitle={t('addMemberDescription')}
                open={addUsersModal}
                onClick={async (): Promise<void> => {
                    const selectedUsers: string[] = [];

                    users.map((item) => {
                        if (inviteeList.includes(getFullName(item.first_name, item.last_name))) {
                            selectedUsers.push(item.id);
                        }
                    });

                    await addUsersToGroup(selectedUsers, selectedGroup!.id);
                    setAddUsersModal(false);
                    openSuccessModal();
                    handleModalClose();
                }}
                onClose={(): void => {
                    setAddUsersModal(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    handleModalClose();
                    setAddUsersModal(false);
                }}
                primaryButton={t('add')}
                primaryButtonType="primary"
                primaryButtonEnabled={isChanged}
                secondaryButton={t('return')}>
                <>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.secondary.medium
                        }}>
                        {t('requiredFields')}
                    </Typography>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={selectedGroup?.title}
                        label={t('groupTitle')}
                        disabled
                    />
                    <FormControl style={{ marginTop: '12px', width: '100%' }}>
                        <InputLabel required id="invites-label">
                            {t('invites')}
                        </InputLabel>
                        <Select
                            labelId="invites-label"
                            id="invites"
                            multiple
                            value={inviteeList}
                            onChange={handleInviteeChange}
                            input={<OutlinedInput label={t('invites')} />}
                            renderValue={(selected): string => selected.join(', ')}>
                            {users.map((item) => (
                                <MenuItem
                                    disabled={selectedGroup?.users.some(
                                        (user) => user.user_id.id === item.id
                                    )}
                                    key={item.id}
                                    value={getFullName(item.first_name, item.last_name)}>
                                    <Avatar
                                        sx={{
                                            background: item.avatarBackground,
                                            color: item.avatarColor,
                                            marginRight: '10px'
                                        }}>
                                        <Typography sx={{ ...body3, fontWeight: 700 }}>
                                            {stringAvatar(item.first_name, item.last_name)}
                                        </Typography>
                                    </Avatar>
                                    <ListItemText
                                        primary={getFullName(item.first_name, item.last_name)}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </>
            </Alert>
        );
    }

    return (
        <>
            {addUsers()}
            {deleteUser()}
            <Alert
                width="440px"
                title={t('modifyGroupTitle')}
                open={modifyModalOpen}
                onClose={(): void => {
                    setModifyModalOpen(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    setModifyModalOpen(false);
                    setAddUsersModal(true);
                }}
                showCloseIcon
                secondaryButton={t('addMember')}>
                <>
                    {selectedGroup?.users.map((user) => {
                        return (
                            <Stack
                                direction={'row'}
                                key={user.id}
                                pb={1}
                                pt={1}
                                justifyContent="space-between"
                                width="100%">
                                <Stack direction="row">
                                    <Avatar
                                        sx={{
                                            background: user.avatarBackground,
                                            color: user.avatarColor,
                                            width: '48px',
                                            height: '48px'
                                        }}>
                                        <Typography sx={{ ...body3, fontWeight: 700 }}>
                                            {stringAvatar(
                                                user.user_id?.first_name,
                                                user.user_id?.last_name
                                            )}
                                        </Typography>
                                    </Avatar>
                                    <Stack sx={{ margin: 'auto 0 auto 10px' }}>
                                        <Typography variant="body2" color={theme.palette.grey[200]}>
                                            {user.user_id?.first_name +
                                                ' ' +
                                                user.user_id?.last_name}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Stack sx={{ margin: 'auto 0' }}>
                                    {user.user_id.id !== currentUser.id && (
                                        <Trash2
                                            color={theme.palette.error.main}
                                            onClick={(): void => {
                                                setModifyModalOpen(false);
                                                setIdToBeDeleted(user.id);
                                                setOpenDeleteUserAlert(true);
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        );
                    })}
                </>
            </Alert>
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('discussionSuccessDescription')}
            />
        </>
    );
}
