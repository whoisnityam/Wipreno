import { LoadingButton } from '@mui/lab';
import {
    Avatar,
    Button,
    Dialog,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Slide,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { NEUTRAL } from '../../../../theme/palette';
import { body3, small2 } from '../../../../theme/typography';
import { getFullName, stringAvatar } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { createDiscussionGroup } from '../../services/DiscussionService';

interface CreateGroupForMobileProps {
    users: User[];
    currentUser: User;
    onClose: Function;
    reload: Function;
    projectId: string;
    openModal: boolean;
}

export const CreateGroupForMobile = ({
    users,
    currentUser,
    openModal,
    projectId,
    reload = (): void => {},
    onClose = (): void => {}
}: CreateGroupForMobileProps): React.ReactElement => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [createGroupDialog, setCreateGroupDialog] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [inviteeList, setInviteeList] = useState<string[]>([]);

    function handleModalClose(): void {
        setCreateGroupDialog(false);
        setTitle('');
        setInviteeList([]);
        onClose();
    }

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

    useEffect(() => {
        const isEmpty = title === '' || inviteeList.length === 0;
        setIsChanged(!isEmpty);
    }, [title, inviteeList]);

    useEffect(() => {
        setCreateGroupDialog(openModal);
    }, [openModal]);

    return (
        <>
            <Slide direction="up" in={createGroupDialog}>
                <Dialog
                    open={createGroupDialog}
                    keepMounted
                    onClose={(): void => {
                        handleModalClose();
                    }}
                    aria-describedby="alert-dialog-messages-of-group"
                    sx={{
                        '.MuiDialog-paper': {
                            padding: '20px',
                            minWidth: '100%',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            position: 'absolute',
                            bottom: '-32px'
                        }
                    }}>
                    <Typography
                        variant="h4"
                        sx={{
                            width: '100%',
                            color: NEUTRAL.darker,
                            marginBottom: theme.spacing(5),
                            textAlign: 'center',
                            marginTop: theme.spacing(5)
                        }}>
                        {t('createGroupTitle')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            marginBottom: theme.spacing(5),
                            width: '100%',
                            textAlign: 'center',
                            color: NEUTRAL.medium
                        }}>
                        {t('createGroupDescription')}
                    </Typography>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.secondary.medium,
                            marginTop: '15%'
                        }}>
                        {t('requiredFields')}
                    </Typography>
                    <TextField
                        sx={{ marginTop: '26px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => setTitle(event.target.value)}
                        label={t('groupTitle')}
                    />
                    <FormControl style={{ marginTop: '12px', marginBottom: '25%', width: '100%' }}>
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
                    <LoadingButton
                        color={'primary'}
                        variant={'contained'}
                        loading={loading}
                        disabled={!isChanged}
                        onClick={async (): Promise<void> => {
                            const selectedUsers: string[] = [];

                            users.map((item) => {
                                if (
                                    inviteeList.includes(
                                        getFullName(item.first_name, item.last_name)
                                    )
                                ) {
                                    selectedUsers.push(item.id);
                                }
                            });
                            selectedUsers.push(currentUser.id);
                            setLoading(true);
                            await createDiscussionGroup(title, selectedUsers, projectId);
                            setLoading(false);
                            handleModalClose();
                            openSuccessModal();
                        }}
                        sx={{
                            margin: '10px 0px 5px'
                        }}>
                        {t('createGroup')}
                    </LoadingButton>
                    <Button
                        variant={'outlined'}
                        onClick={(): void => {
                            handleModalClose();
                        }}
                        sx={{
                            color: theme.palette.secondary.medium,
                            borderColor: theme.palette.secondary.medium,
                            ':hover': {
                                borderColor: theme.palette.secondary.medium
                            },
                            margin: '5px 0px 10px'
                        }}>
                        {t('return')}
                    </Button>
                </Dialog>
            </Slide>
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('discussionSuccessDescription')}
            />
        </>
    );
};
