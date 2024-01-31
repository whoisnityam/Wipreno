import { Avatar, Box, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { User } from '../../../profile/models/User';
import { body3, small2 } from '../../../../theme/typography';
import { downloadURI, getFileURL, stringAvatar } from '../../../../utils';
import { Discussions } from '../../models/Discussions';
import { getDiscussionByGroupId } from '../../services/DiscussionService';

interface MessageListProps {
    isAdded: boolean;
    groupId: string;
    users: User[];
    currentUser: User;
}

export const MessageList = ({
    isAdded,
    groupId,
    users,
    currentUser
}: MessageListProps): React.ReactElement => {
    const theme = useTheme();
    const [messages, setMessages] = useState<Discussions[]>([]);

    function scrollToBottom(): void {
        const element = document.getElementById('content');
        if (element) {
            {
                element.scrollIntoView(false);
            }
        }
    }

    const fetchMessages = async (): Promise<void> => {
        let list: Discussions[] = [];
        if (groupId) {
            list = await getDiscussionByGroupId(groupId);
        }
        setMessages(list);
        scrollToBottom();
    };

    useEffect(() => {
        fetchMessages();
    }, [isAdded, groupId]);

    return (
        <Stack
            pb={'8px'}
            pl={'8px'}
            pr={'0'}
            id="content"
            sx={{
                justifyContent: 'flex-end',
                width: '100%'
            }}>
            {messages!.map((row, index) => {
                users.map((user) => {
                    if (user.id === row.created_by?.id) {
                        row.created_by.avatarBackground = user.avatarBackground;
                        row.created_by.avatarColor = user.avatarColor;
                    }
                });

                if (
                    row.created_by?.first_name !== currentUser.first_name &&
                    row.created_by?.last_name !== currentUser.last_name
                ) {
                    return (
                        <Box
                            key={index}
                            mt={2}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'end'
                            }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}>
                                <Avatar
                                    sx={{
                                        background: row.created_by?.avatarBackground,
                                        color: row.created_by?.avatarColor,
                                        width: '38px',
                                        height: '38px',
                                        marginRight: '22px'
                                    }}>
                                    <Typography sx={{ ...small2 }}>
                                        {stringAvatar(
                                            row.created_by?.first_name,
                                            row.created_by?.last_name
                                        )}
                                    </Typography>
                                </Avatar>
                            </Box>
                            <Stack sx={{ alignItems: 'start', wordBreak: 'break-word' }}>
                                {row.message !== '' && (
                                    <Typography
                                        p={2}
                                        mr={2}
                                        variant="body1"
                                        color={row.created_by?.avatarColor}
                                        sx={{
                                            fontWeight: 400,
                                            backgroundColor: row.created_by?.avatarBackground,
                                            borderRadius: '8px 8px 8px 0px',
                                            maxWidth: '85%',
                                            overflowWrap: 'break-word'
                                        }}>
                                        {row.message}
                                    </Typography>
                                )}
                                {row.file_id ? (
                                    row.file_id.type === 'application/pdf' ? (
                                        <Stack
                                            direction="row"
                                            sx={{ width: '200px', borderRadius: '4px' }}>
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
                                                        getFileURL(row.file_id!.id),
                                                        row.file_id!.title!
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
                                                    {row.file_id.title}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        <img
                                            onClick={(): void => {
                                                downloadURI(
                                                    getFileURL(row.file_id!.id),
                                                    row.file_id!.title!
                                                );
                                            }}
                                            style={{
                                                borderRadius: '8px 8px 8px 0px',
                                                width: '200px'
                                            }}
                                            src={getFileURL(row.file_id!.id)}
                                        />
                                    )
                                ) : (
                                    <></>
                                )}
                            </Stack>
                        </Box>
                    );
                } else {
                    return (
                        <Box
                            key={index}
                            mt={2}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'end'
                            }}>
                            <Stack sx={{ alignItems: 'end', wordBreak: 'break-word' }}>
                                {row.message !== '' && (
                                    <Typography
                                        p={2}
                                        ml={2}
                                        variant="body1"
                                        color={ACCENT_SUNSET.darker}
                                        sx={{
                                            fontWeight: 400,
                                            backgroundColor: ACCENT_SUNSET.lighter,
                                            borderRadius: '8px 8px 0px 8px',
                                            maxWidth: '85%',
                                            overflowWrap: 'break-word'
                                        }}>
                                        {row.message}
                                    </Typography>
                                )}
                                {row.file_id ? (
                                    row.file_id.type === 'application/pdf' ? (
                                        <Stack
                                            direction="row"
                                            sx={{ width: '200px', borderRadius: '4px' }}>
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
                                                        getFileURL(row.file_id!.id),
                                                        row.file_id!.title!
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
                                                    {row.file_id.title}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        <img
                                            onClick={(): void => {
                                                downloadURI(
                                                    getFileURL(row.file_id!.id),
                                                    row.file_id!.title!
                                                );
                                            }}
                                            style={{
                                                borderRadius: '8px 8px 0px 8px',
                                                width: '200px'
                                            }}
                                            src={getFileURL(row.file_id!.id)}
                                        />
                                    )
                                ) : (
                                    <></>
                                )}
                            </Stack>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                <Avatar
                                    sx={{
                                        background: ACCENT_SUNSET.lighter,
                                        color: ACCENT_SUNSET.darker,
                                        width: '38px',
                                        height: '38px',
                                        marginLeft: '22px'
                                    }}>
                                    <Typography sx={{ ...small2 }}>
                                        {stringAvatar(
                                            row.created_by?.first_name,
                                            row.created_by?.last_name
                                        )}
                                    </Typography>
                                </Avatar>
                            </Box>
                        </Box>
                    );
                }
            })}
        </Stack>
    );
};
