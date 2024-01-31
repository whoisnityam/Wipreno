import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    Dialog,
    InputAdornment,
    InputBase,
    Slide,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { Camera, MoreHorizontal, Paperclip, Plus, Search, Send, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Searchbar } from '../../../../components/textfield/Searchbar';
import { uploadFile } from '../../../../services/DirectusService';
import { NEUTRAL } from '../../../../theme/palette';
import { body3, small2 } from '../../../../theme/typography';
import { downloadURI } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { DiscussionGroup, Participants } from '../../models/DiscussionGroup';
import { createDiscussion } from '../../services/DiscussionService';
import { ArchiveGroup } from './ArchiveGroup';
import { CreateGroup } from './CreateGroup';
import { CreateGroupForMobile } from './CreateGroupForMobile';
import { GroupDiscussionAvatar } from './GroupDiscussionAvatar';
import { GroupList } from './GroupList';
import { MessageList } from './MessageList';
import { ModifyGroup } from './ModifyGroup';
import { MoreOptions } from './MoreOptions';
import { NoMessages } from './NoMessages';

interface DiscussionProps {
    projectId: string;
    groupList: DiscussionGroup[];
    users: User[];
    currentUser: User;
    reload: Function;
}
export const ProjectDiscussionChatbox = ({
    projectId,
    groupList,
    users,
    currentUser,
    reload = (): void => {}
}: DiscussionProps): ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [style, setStyle] = useState({ display: 'none' });
    const [newMessage, setNewMessage] = useState<string>('');
    const [isAdded, setIsAdded] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [modifyModalOpen, setModifyModalOpen] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [fileTypeIsPdf, setFileTypeIsPdf] = useState<boolean>();
    const [groupId, setGroupId] = useState<string>();
    const [selectedGroup, setSelectedGroup] = useState<DiscussionGroup>();
    const [document, setDocument] = useState<File | null>(null);
    const inputFile = useRef<HTMLInputElement>(null);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [createGroupDialog, setCreateGroupDialog] = useState(false);
    const [participants, setParticipants] = useState<Participants[]>([]);

    const handleClose = (): void => {
        setMessagesOpen(false);
    };

    useEffect(() => {
        groupList.map((group) => {
            if (group.id === groupId) {
                setSelectedGroup(group);
            }
        });
    }, [groupId]);

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };
    useEffect(() => {
        if (fileTypeIsPdf !== undefined) {
            triggerFileUpload();
            setFileTypeIsPdf(undefined);
        }
    }, [fileTypeIsPdf]);
    useEffect(() => {
        if (selectedGroup) {
            const data = selectedGroup.users.map((user) => {
                return {
                    name: user.user_id?.first_name + ' ' + user.user_id?.last_name,
                    avatarBackground: user.avatarBackground!,
                    avatarColor: user.avatarColor!
                };
            });
            setParticipants(data);
        }
    }, [selectedGroup]);

    const onSend = async (): Promise<void> => {
        const commentData = {
            id: '',
            message: newMessage,
            discussion_group_id: groupId!,
            created_at: new Date()
        };
        if (document !== null) {
            const fileData = await uploadFile(document);
            const data = await createDiscussion(commentData, fileData.id);
            groupList.map((group) => {
                if (group.id === groupId) {
                    group.discussions.push(data);
                }
            });
            setDocument(null);
        } else if (newMessage !== '') {
            const data = await createDiscussion(commentData);
            groupList.map((group) => {
                if (group.id === groupId) {
                    group.discussions.push(data);
                }
            });
        }
        setIsAdded(!isAdded);
        setNewMessage('');
    };

    const getTextField = (): React.ReactElement => {
        return (
            <Stack
                direction="row"
                sx={{ margin: '16px', height: document !== null ? '104px' : '48px' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: `1px solid ${theme.palette.grey[100]}`,
                        width: '100%'
                    }}>
                    <Stack sx={{ width: 'calc(100% - 40px)' }}>
                        <InputBase
                            endAdornment={
                                <InputAdornment position="end">
                                    <Stack direction="row" spacing={1}>
                                        <Paperclip
                                            color={theme.palette.grey[100]}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(): void => {
                                                setFileTypeIsPdf(true);
                                            }}
                                        />
                                        <Camera
                                            color={theme.palette.grey[100]}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(): void => {
                                                setFileTypeIsPdf(false);
                                            }}
                                        />
                                        <input
                                            type="file"
                                            name="document"
                                            accept={
                                                fileTypeIsPdf
                                                    ? 'application/pdf'
                                                    : 'image/jpeg, image/png, image/jpg, image/JPG, image/PNG, image/JPEG'
                                            }
                                            id="document"
                                            ref={inputFile}
                                            onChange={(
                                                event: ChangeEvent<HTMLInputElement>
                                            ): void => {
                                                const supportedExtensions = [
                                                    'jpeg',
                                                    'png',
                                                    'jpg',
                                                    'JPG',
                                                    'PNG',
                                                    'JPEG'
                                                ];
                                                const path = event.target.value.split('.');
                                                const extension = `${path[path.length - 1]}`;

                                                if (
                                                    event.target.files &&
                                                    event.target.files[0] !== null &&
                                                    event.target.files[0] !== undefined
                                                ) {
                                                    if (
                                                        event.target.files[0].type ===
                                                        'application/pdf'
                                                    ) {
                                                        setDocument(event.target.files[0]);
                                                    } else if (
                                                        supportedExtensions.includes(extension)
                                                    ) {
                                                        setDocument(event.target.files[0]);
                                                    } else {
                                                        window.alert(t('unsupportedFileType'));
                                                        event.target.value = '';
                                                    }
                                                }
                                            }}
                                            style={{
                                                display: 'none',
                                                height: '150px',
                                                width: '150px'
                                            }}
                                        />
                                    </Stack>
                                </InputAdornment>
                            }
                            disabled={selectedGroup?.is_deleted}
                            placeholder={t('writeMessage')}
                            sx={{
                                ...theme.typography.body2,
                                borderRadius: '4px',
                                width: '100%',
                                paddingLeft: '8px',
                                margin: '0 16px 0 16px',
                                height: '48px'
                            }}
                            value={newMessage}
                            onChange={(e): void => {
                                setNewMessage(e.target.value);
                            }}
                            onKeyDown={async (event): Promise<void> => {
                                if (event.key === 'Enter') {
                                    setLoading(true);
                                    await onSend();
                                    setLoading(false);
                                }
                            }}
                        />

                        {document !== null ? (
                            <Stack
                                direction="row"
                                alignItems={'flex-end'}
                                onMouseEnter={(): void => {
                                    setStyle({ display: 'block' });
                                }}
                                onMouseLeave={(): void => {
                                    setStyle({ display: 'none' });
                                }}>
                                {document.type === 'application/pdf' ? (
                                    <Stack
                                        direction="row"
                                        sx={{
                                            width: '200px',
                                            borderRadius: '4px',
                                            margin: '0 24px 12px'
                                        }}>
                                        <Stack
                                            sx={{
                                                minWidth: '40px',
                                                width: '40px',
                                                height: '40px',
                                                background: theme.palette.error.medium
                                            }}>
                                            <Typography
                                                sx={{
                                                    ...small2,
                                                    margin: 'auto',
                                                    color: NEUTRAL.white
                                                }}>
                                                PDF
                                            </Typography>
                                        </Stack>
                                        <Stack
                                            sx={{
                                                height: '40px',
                                                width: '160px',
                                                border: `1px solid ${NEUTRAL.light}`
                                            }}
                                            onClick={(): void => {
                                                downloadURI(
                                                    window.URL.createObjectURL(document),
                                                    document.name
                                                );
                                            }}>
                                            <Typography
                                                sx={{
                                                    ...body3,
                                                    color: NEUTRAL.dark,
                                                    margin: 'auto',
                                                    padding: '0 10px'
                                                }}
                                                maxWidth="23ch"
                                                textOverflow="ellipsis"
                                                overflow="hidden"
                                                whiteSpace="nowrap">
                                                {document.name}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <img
                                        onClick={(): void => {
                                            downloadURI(
                                                window.URL.createObjectURL(document),
                                                document.name
                                            );
                                        }}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            margin: '0 24px 12px'
                                        }}
                                        src={window.URL.createObjectURL(document)}
                                    />
                                )}
                                <Box
                                    sx={
                                        isLarge
                                            ? {
                                                  ...style,
                                                  position: 'relative',
                                                  zIndex: 1
                                              }
                                            : {
                                                  display: 'block',
                                                  position: 'relative',
                                                  zIndex: 1
                                              }
                                    }>
                                    <X
                                        style={{
                                            color: NEUTRAL.dark,
                                            backgroundColor: NEUTRAL.lighter,
                                            borderRadius: '100%',
                                            width: '20px',
                                            height: '20px',
                                            strokeWidth: '4',
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            top: '-60px',
                                            left: '-30px'
                                        }}
                                        onClick={(): void => {
                                            setDocument(null);
                                        }}
                                    />
                                </Box>
                            </Stack>
                        ) : (
                            <></>
                        )}
                    </Stack>
                </Box>
                <LoadingButton
                    loading={loading}
                    disabled={groupId && !selectedGroup?.is_deleted ? false : true}
                    variant={'contained'}
                    onClick={async (): Promise<void> => {
                        setLoading(true);
                        await onSend();
                        setLoading(false);
                    }}
                    sx={{
                        height: '48px',
                        width: '48px',
                        marginLeft: '16px'
                    }}>
                    <Send />
                </LoadingButton>
            </Stack>
        );
    };

    const viewMessagesForMobile = (): React.ReactElement => {
        return (
            <Slide direction="up" in={messagesOpen}>
                <Dialog
                    open={messagesOpen}
                    keepMounted
                    onClose={handleClose}
                    aria-describedby="alert-dialog-messages-of-group"
                    sx={{
                        '.MuiDialog-paper': {
                            minHeight: 'calc(100% - 40px)',
                            maxHeight: 'calc(100% - 40px)',
                            minWidth: '100%',
                            maxWidth: '100%',
                            height: '100%',
                            margin: 'unset',
                            marginTop: '40px'
                        }
                    }}>
                    <Stack
                        sx={{
                            borderLeft: `1px solid ${theme.palette.grey[100]}`
                        }}
                        height="100%"
                        width="100%">
                        <Box
                            pl={2}
                            pr={2}
                            sx={{
                                height: '72px',
                                minHeight: '72px',
                                overflowY: 'auto',
                                display: 'flex',
                                borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                justifyContent: 'space-between'
                            }}>
                            <Stack direction="column" sx={{ margin: 'auto 0' }} width="100%">
                                <Stack
                                    direction="row"
                                    justifyContent={'space-between'}
                                    width="100%">
                                    <Typography
                                        variant="h5"
                                        color={theme.palette.primary.main}
                                        sx={{
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: 'inline-block',
                                            width: '70vw'
                                        }}>
                                        {selectedGroup?.title}
                                    </Typography>
                                    <Stack direction={'row'} spacing={2} sx={{ margin: 'auto 0' }}>
                                        <MoreHorizontal
                                            color={theme.palette.primary.medium}
                                            size={30}
                                            onClick={(): void => {
                                                handleClose();
                                                setMoreMenuOpen(true);
                                            }}
                                        />
                                        <X
                                            color={theme.palette.error.main}
                                            size={30}
                                            onClick={handleClose}
                                        />
                                    </Stack>
                                </Stack>
                                <Typography color={theme.palette.grey[200]} sx={{ ...body3 }}>
                                    {selectedGroup?.users.length + ' ' + t('members')}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box
                            pl={2}
                            pr={2}
                            sx={{
                                height: '100%',
                                overflowY: 'auto',
                                justifyContent: 'flex-end'
                            }}>
                            {selectedGroup ? (
                                <MessageList
                                    isAdded={isAdded}
                                    groupId={groupId!}
                                    users={users}
                                    currentUser={currentUser}
                                />
                            ) : (
                                <NoMessages />
                            )}
                        </Box>
                        {selectedGroup && getTextField()}
                    </Stack>
                </Dialog>
            </Slide>
        );
    };

    return (
        <>
            <CreateGroup
                users={users}
                currentUser={currentUser}
                projectId={projectId}
                openModal={createModalOpen}
                reload={(): void => {
                    reload();
                }}
                onClose={(): void => {
                    setCreateModalOpen(false);
                }}
            />
            <ModifyGroup
                users={users}
                currentUser={currentUser}
                openModal={modifyModalOpen}
                reload={(): void => {
                    reload();
                }}
                onClose={(): void => {
                    setModifyModalOpen(false);
                }}
                groupSelected={selectedGroup}
            />
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
            {isLarge ? (
                <Stack
                    p={4}
                    sx={{
                        backgroundColor: NEUTRAL.white,
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                    <Stack
                        sx={{
                            border: `1px solid ${theme.palette.grey[100]}`
                        }}
                        direction="row">
                        <Stack width={'30%'}>
                            {showSearchBar ? (
                                <Box
                                    pl={2}
                                    pr={2}
                                    sx={{
                                        height: '72px',
                                        overflowY: 'auto',
                                        borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                        width: '100%'
                                    }}>
                                    <Searchbar
                                        iconAtRight
                                        searchText={searchText}
                                        onChange={(searchTerm): void => setSearchText(searchTerm)}
                                        width="100%"
                                        label={t('searchGroup')}
                                        onClick={(): void => {
                                            setSearchText('');
                                            setShowSearchBar(false);
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    pl={2}
                                    pr={2}
                                    sx={{
                                        height: '72px',
                                        overflowY: 'auto',
                                        display: 'flex',
                                        borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }}>
                                    <Typography
                                        variant="body1"
                                        color={NEUTRAL.dark}
                                        sx={{ fontWeight: 700, margin: 'auto 0' }}>
                                        {t('Groupes de discussion')}
                                    </Typography>
                                    <Stack direction="row" spacing={2} sx={{ margin: 'auto 0' }}>
                                        <Button
                                            sx={{ padding: '0', minWidth: '24px' }}
                                            onClick={(): void => {
                                                setShowSearchBar(true);
                                            }}>
                                            <Search color={`${NEUTRAL.light}`} />
                                        </Button>
                                        <Button
                                            sx={{ padding: '0', minWidth: '24px' }}
                                            onClick={(): void => {
                                                setCreateModalOpen(true);
                                            }}>
                                            <Plus color={`${theme.palette.secondary.medium}`} />
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            <GroupList
                                currentUser={currentUser}
                                key={searchText}
                                searchText={searchText}
                                groupList={groupList}
                                onClick={(id: string): void => {
                                    setGroupId(id);
                                }}
                            />
                        </Stack>

                        <Stack
                            sx={{
                                borderLeft: `1px solid ${theme.palette.grey[100]}`
                            }}
                            width="100%">
                            <Box
                                pl={2}
                                pr={2}
                                sx={{
                                    height: '72px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                    justifyContent: 'space-between'
                                }}>
                                <Stack direction="row" spacing={4}>
                                    <Typography
                                        variant="h5"
                                        color={theme.palette.primary.main}
                                        sx={{
                                            fontWeight: 700,
                                            margin: 'auto 0',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: 'inline-block',
                                            maxWidth: '30vw'
                                        }}>
                                        {selectedGroup?.title}
                                    </Typography>
                                    <div
                                        style={{ margin: 'auto 10px', cursor: 'pointer' }}
                                        onClick={(): void => {
                                            setModifyModalOpen(true);
                                        }}>
                                        {selectedGroup && (
                                            <GroupDiscussionAvatar
                                                max={4}
                                                participants={participants}
                                            />
                                        )}
                                    </div>
                                </Stack>
                                {!selectedGroup?.is_deleted
                                    ? selectedGroup && (
                                          <Button
                                              variant={'outlined'}
                                              onClick={(): void => {
                                                  setOpenDeleteAlert(true);
                                              }}
                                              sx={{
                                                  color: theme.palette.error.main,
                                                  borderColor: theme.palette.error.main,
                                                  ':hover': {
                                                      borderColor: theme.palette.error.main
                                                  },
                                                  margin: 'auto 0'
                                              }}>
                                              {t('archiveDiscussion')}
                                          </Button>
                                      )
                                    : selectedGroup && (
                                          <Button
                                              variant={'outlined'}
                                              onClick={(): void => {
                                                  setOpenDeleteAlert(true);
                                              }}
                                              sx={{
                                                  color: theme.palette.secondary.medium,
                                                  borderColor: theme.palette.secondary.medium,
                                                  ':hover': {
                                                      borderColor: theme.palette.secondary.medium
                                                  },
                                                  margin: 'auto 0'
                                              }}>
                                              {t('unarchiveDiscussion')}
                                          </Button>
                                      )}
                            </Box>
                            <Box
                                pl={2}
                                pr={2}
                                sx={{
                                    height: '300px',
                                    overflowY: 'auto',
                                    justifyContent: 'flex-end'
                                }}>
                                {selectedGroup ? (
                                    <MessageList
                                        isAdded={isAdded}
                                        groupId={groupId!}
                                        users={users}
                                        currentUser={currentUser}
                                    />
                                ) : (
                                    <NoMessages />
                                )}
                            </Box>
                            {selectedGroup && getTextField()}
                        </Stack>
                    </Stack>
                </Stack>
            ) : (
                <>
                    <MoreOptions
                        selectedGroup={selectedGroup}
                        openModal={moreMenuOpen}
                        reload={(): void => {
                            reload();
                        }}
                        onClose={(): void => {
                            setMoreMenuOpen(false);
                        }}
                    />
                    {viewMessagesForMobile()}
                    <CreateGroupForMobile
                        openModal={createGroupDialog}
                        projectId={projectId}
                        users={users}
                        currentUser={currentUser}
                        reload={(): void => {
                            reload();
                        }}
                        onClose={(): void => {
                            setCreateGroupDialog(false);
                        }}
                    />

                    <Stack
                        width={'100%'}
                        sx={{
                            border: `1px solid ${theme.palette.grey[100]}`
                        }}>
                        {showSearchBar ? (
                            <Box
                                pl={2}
                                pr={2}
                                sx={{
                                    height: '72px',
                                    overflowY: 'auto',
                                    borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                    width: '100%'
                                }}>
                                <Searchbar
                                    iconAtRight
                                    searchText={searchText}
                                    onChange={(searchTerm): void => setSearchText(searchTerm)}
                                    width="100%"
                                    label={t('searchGroup')}
                                    onClick={(): void => {
                                        setShowSearchBar(false);
                                    }}
                                />
                            </Box>
                        ) : (
                            <Box
                                pl={2}
                                pr={2}
                                sx={{
                                    height: '72px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    borderBottom: `1px solid ${theme.palette.grey[100]}`,
                                    width: '100%',
                                    justifyContent: 'space-between'
                                }}>
                                <Typography
                                    variant="body1"
                                    color={NEUTRAL.dark}
                                    sx={{ fontWeight: 700, margin: 'auto 0' }}>
                                    {t('Groupes de discussion')}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ margin: 'auto 0' }}>
                                    <Button
                                        sx={{ padding: '0', minWidth: '24px' }}
                                        onClick={(): void => {
                                            setShowSearchBar(true);
                                        }}>
                                        <Search color={`${NEUTRAL.light}`} />
                                    </Button>
                                    <Button
                                        sx={{ padding: '0', minWidth: '24px' }}
                                        onClick={(): void => {
                                            setCreateGroupDialog(true);
                                        }}>
                                        <Plus color={`${theme.palette.secondary.medium}`} />
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        <GroupList
                            currentUser={currentUser}
                            key={searchText}
                            searchText={searchText}
                            groupList={groupList}
                            onClick={(id: string): void => {
                                setGroupId(id);
                                setMessagesOpen(true);
                            }}
                        />
                    </Stack>
                </>
            )}
        </>
    );
};
