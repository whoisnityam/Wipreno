import {
    Avatar,
    Button,
    Dialog,
    IconButton,
    Slide,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { body3 } from '../../../../theme/typography';
import { stringAvatar } from '../../../../utils';
import { DiscussionGroup } from '../../models/DiscussionGroup';
import { ArchiveGroup } from './ArchiveGroup';

interface MoreOptionsProps {
    selectedGroup: DiscussionGroup | undefined;
    openModal: boolean;
    reload: Function;
    onClose: Function;
}

export const MoreOptions = ({
    selectedGroup,
    openModal,
    reload = (): void => {},
    onClose = (): void => {}
}: MoreOptionsProps): React.ReactElement => {
    const theme = useTheme();
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [viewMembers, setViewMembers] = useState(false);
    const { t } = useTranslation();

    const handleMenuClose = (): void => {
        setMoreMenuOpen(false);
        onClose();
    };

    useEffect(() => {
        setMoreMenuOpen(openModal);
    }, [openModal]);

    const viewMembersForMobile = (): React.ReactElement => {
        return (
            <Slide direction="up" in={viewMembers}>
                <Dialog
                    open={viewMembers}
                    keepMounted
                    onClose={(): void => {
                        setViewMembers(false);
                    }}
                    aria-describedby="alert-dialog-messages-of-group"
                    sx={{
                        '.MuiDialog-paper': {
                            padding: '20px',
                            minWidth: '100%',
                            maxWidth: '100%',
                            position: 'absolute',
                            bottom: '-32px'
                        }
                    }}>
                    <Stack width="100%" direction="row" justifyContent={'space-between'}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: theme.palette.primary.medium,
                                marginBottom: theme.spacing(2)
                            }}>
                            {t('modifyGroupTitle')}
                        </Typography>
                        <X
                            size={30}
                            color={theme.palette.primary.medium}
                            onClick={(): void => {
                                setViewMembers(false);
                            }}
                        />
                    </Stack>

                    {selectedGroup?.users.map((user) => {
                        return (
                            <Stack
                                direction={'row'}
                                key={user.id}
                                pb={1}
                                pt={1}
                                spacing={2}
                                width="100%">
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
                                <Stack sx={{ margin: 'auto 10px !important' }}>
                                    <Typography variant="body2" color={theme.palette.grey[200]}>
                                        {user.user_id?.first_name + ' ' + user.user_id?.last_name}
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Dialog>
            </Slide>
        );
    };

    return (
        <>
            <ArchiveGroup
                selectedGroup={selectedGroup}
                openModal={openDeleteAlert}
                reload={(): void => {
                    reload();
                }}
                onClose={(): void => {
                    setOpenDeleteAlert(false);
                }}
            />
            <Slide direction="up" in={moreMenuOpen}>
                <Dialog
                    open={moreMenuOpen}
                    keepMounted
                    onClose={handleMenuClose}
                    aria-describedby="alert-dialog-messages-of-group"
                    sx={{
                        '.MuiDialog-paper': {
                            minWidth: '100%',
                            maxWidth: '100%',
                            height: '180px',
                            position: 'absolute',
                            bottom: '-32px'
                        }
                    }}>
                    <IconButton
                        aria-label="close"
                        onClick={handleMenuClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.primary.medium
                        }}>
                        <X />
                    </IconButton>
                    <Button
                        variant={'outlined'}
                        onClick={(): void => {
                            handleMenuClose();
                            setViewMembers(true);
                        }}
                        sx={{
                            color: theme.palette.secondary.medium,
                            borderColor: theme.palette.secondary.medium,
                            ':hover': {
                                borderColor: theme.palette.secondary.medium
                            },
                            margin: '55px 20px 5px'
                        }}>
                        {t('viewMembers')}
                    </Button>
                    {!selectedGroup?.is_deleted
                        ? selectedGroup && (
                              <Button
                                  variant={'outlined'}
                                  onClick={(): void => {
                                      handleMenuClose();
                                      setOpenDeleteAlert(true);
                                  }}
                                  sx={{
                                      color: theme.palette.error.main,
                                      borderColor: theme.palette.error.main,
                                      ':hover': {
                                          borderColor: theme.palette.error.main
                                      },
                                      margin: '5px 20px'
                                  }}>
                                  {t('archiveDiscussion')}
                              </Button>
                          )
                        : selectedGroup && (
                              <Button
                                  variant={'outlined'}
                                  onClick={(): void => {
                                      handleMenuClose();
                                      setOpenDeleteAlert(true);
                                  }}
                                  sx={{
                                      color: theme.palette.secondary.medium,
                                      borderColor: theme.palette.secondary.medium,
                                      ':hover': {
                                          borderColor: theme.palette.secondary.medium
                                      },
                                      margin: '5px 20px'
                                  }}>
                                  {t('unarchiveDiscussion')}
                              </Button>
                          )}
                </Dialog>
            </Slide>
            {viewMembersForMobile()}
        </>
    );
};
