import {
    Avatar,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { body3, small2 } from '../../../../theme/typography';
import { getFullName, stringAvatar } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { createDiscussionGroup } from '../../services/DiscussionService';

interface CreateGroupProps {
    users: User[];
    currentUser: User;
    projectId: string;
    reload: Function;
    openModal: boolean;
    onClose: Function;
}

export function CreateGroup({
    users,
    currentUser,
    openModal,
    projectId,
    reload = (): void => {},
    onClose = (): void => {}
}: CreateGroupProps): React.ReactElement {
    const theme = useTheme();
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [inviteeList, setInviteeList] = useState<string[]>([]);

    function handleModalClose(): void {
        setTitle('');
        setInviteeList([]);
        onClose();
    }

    useEffect(() => {
        setCreateModalOpen(openModal);
    }, [openModal]);

    useEffect(() => {
        const isEmpty = title === '' || inviteeList.length === 0;
        setIsChanged(!isEmpty);
    }, [title, inviteeList]);

    const handleInviteeChange = (event: SelectChangeEvent<typeof inviteeList>): void => {
        const {
            target: { value }
        } = event;
        setInviteeList(typeof value === 'string' ? value.split(',') : value);
    };

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            reload();
        }, 3000);
    };

    return (
        <>
            <Alert
                width="440px"
                height="544px"
                title={t('createGroupTitle')}
                subtitle={t('createGroupDescription')}
                open={createModalOpen}
                onClick={async (): Promise<void> => {
                    const selectedUsers: string[] = [];

                    users.map((item) => {
                        if (inviteeList.includes(getFullName(item.first_name, item.last_name))) {
                            selectedUsers.push(item.id);
                        }
                    });
                    selectedUsers.push(currentUser.id);

                    await createDiscussionGroup(title, selectedUsers, projectId);
                    setCreateModalOpen(false);
                    openSuccessModal();
                    handleModalClose();
                }}
                onClose={(): void => {
                    setCreateModalOpen(false);
                    handleModalClose();
                }}
                onSecondaryButtonClick={(): void => {
                    handleModalClose();
                    setCreateModalOpen(false);
                }}
                primaryButton={t('createGroup')}
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
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('groupTitle')}
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
                            MenuProps={{
                                PaperProps: { sx: { maxHeight: '25%' } }
                            }}
                            renderValue={(selected): string => selected.join(', ')}>
                            {users.map((item) => (
                                <MenuItem
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
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('discussionSuccessDescription')}
            />
        </>
    );
}
