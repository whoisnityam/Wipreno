import {
    Avatar,
    Box,
    Button,
    DialogContent,
    DialogTitle,
    IconButton,
    InputBase,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Send, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../../provider/UserProvider';
import { NEUTRAL } from '../../../../theme/palette';
import { small2 } from '../../../../theme/typography';
import { stringAvatar } from '../../../../utils';
import { Comments } from '../../models/Comments';
import { createComment, getCommentsByProjectId } from '../../services/CommentService';
import { Comment } from './Comment';

interface CommentProps {
    projectId: string;
    onClose?: () => void;
}

export const ProjectComments = ({
    projectId,
    onClose = (): void => {}
}: CommentProps): ReactElement => {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [newComment, setNewComment] = useState<string>('');
    const [comments, setComments] = useState<Comments[]>();
    const [isAdded, setIsAdded] = useState(true);

    function scrollToBottom(): void {
        const element = document.getElementById('content');
        if (element) {
            {
                element.scrollIntoView(false);
            }
        }
    }

    const fetchComments = useCallback(async () => {
        const list = await getCommentsByProjectId(projectId);
        setComments(list);
        scrollToBottom();
    }, []);

    useEffect(() => {
        fetchComments();
    }, [isAdded]);

    const noComments = (): React.ReactElement => {
        return (
            <Stack height={'100%'} justifyContent={'center'}>
                <Typography
                    variant="h4"
                    color={theme.palette.grey[100]}
                    sx={{ fontFamily: 'Poppins', fontWeight: 700, textAlign: 'center' }}>
                    {t('noCommentAdded')}
                </Typography>
                <Typography
                    variant="h5"
                    color={theme.palette.grey[200]}
                    sx={{
                        fontFamily: 'Poppins',
                        fontWeight: 400,
                        textAlign: 'center',
                        marginTop: '5%'
                    }}>
                    {t('addCommentToShareInformation')}
                </Typography>
            </Stack>
        );
    };

    const commentsList = (): React.ReactElement => {
        return (
            <Box
                pb={'8px'}
                pl={'8px'}
                pr={'8px'}
                id="content"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    width: '100%',
                    wordBreak: 'break-word'
                }}>
                {comments!.map((row, index) =>
                    row.created_by?.first_name !== user.user?.first_name &&
                    row.created_by?.last_name !== user.user?.last_name ? (
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
                                        background: theme.palette.secondary.lighter,
                                        color: theme.palette.secondary.darker,
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
                            <Typography
                                p={2}
                                mr={2}
                                variant="body1"
                                color={theme.palette.secondary.darker}
                                sx={{
                                    fontWeight: 400,
                                    backgroundColor: theme.palette.secondary.lighter,
                                    borderRadius: '8px 8px 0px 8px',
                                    maxWidth: '85%',
                                    overflowWrap: 'break-word'
                                }}>
                                {row.comment}
                            </Typography>
                        </Box>
                    ) : (
                        <Comment
                            row={row}
                            key={row.id}
                            reload={(): void => {
                                setIsAdded(!isAdded);
                            }}
                        />
                    )
                )}
            </Box>
        );
    };

    const onSend = async (): Promise<void> => {
        if (newComment !== '') {
            try {
                const commentData = {
                    id: '',
                    comment: newComment,
                    project_id: projectId,
                    created_at: new Date()
                };
                await createComment(commentData);
                setIsAdded(!isAdded);
                setNewComment('');
            } catch (e) {
                console.log(e);
            }
        }
    };
    const getTextField = (): React.ReactElement => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    [theme.breakpoints.up('md')]: {
                        borderTop: `1px solid ${theme.palette.grey[100]}`
                    },
                    [theme.breakpoints.down('md')]: {
                        marginBottom: '16px'
                    },
                    height: '48px'
                }}>
                <InputBase
                    placeholder={t('addComment')}
                    sx={{
                        border: {
                            xs: `1px solid ${NEUTRAL.light}`,
                            sm: `1px solid ${NEUTRAL.light}`,
                            md: 'none'
                        },
                        ...theme.typography.body2,
                        borderRadius: '4px',
                        width: '90%',
                        paddingLeft: '8px',
                        margin: '0 16px 0 16px',
                        height: { xs: '48px', sm: '48px', md: 'auto' }
                    }}
                    value={newComment}
                    onChange={(e): void => {
                        setNewComment(e.target.value);
                    }}
                    onKeyDown={async (event): Promise<void> => {
                        if (event.key === 'Enter') {
                            await onSend();
                        }
                    }}
                />
                {!isLarge && (
                    <Button
                        variant={'contained'}
                        onClick={onSend}
                        sx={{ height: '48px', width: '48px', marginRight: '16px' }}>
                        <Send />
                    </Button>
                )}
                {isLarge && (
                    <Send
                        color={newComment.trim() === '' ? theme.palette.grey[100] : NEUTRAL.medium}
                        style={{ width: '30px', height: '30px', marginRight: '10px' }}
                        onClick={onSend}
                    />
                )}
            </Box>
        );
    };

    return (
        <>
            {!isLarge && (
                <>
                    <DialogTitle
                        variant={'h6'}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                        {t('historyOfProject')}
                        <IconButton onClick={onClose} aria-label="close">
                            <X
                                style={{
                                    color: theme.palette.error.main
                                }}
                            />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent
                        dividers
                        sx={{
                            padding: 'unset',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <Box
                            sx={{
                                overflowY: 'auto',
                                height: '100%',
                                margin: comments && comments.length > 0 ? 'unset' : 'auto',
                                flexGrow: comments && comments.length > 0 ? '1' : 'unset'
                            }}>
                            {comments && comments.length > 0 ? commentsList() : noComments()}
                        </Box>
                        <Box>{getTextField()}</Box>
                    </DialogContent>
                </>
            )}
            {isLarge && (
                <Box
                    p={4}
                    sx={{
                        backgroundColor: NEUTRAL.white,
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingBottom: 4
                        }}>
                        <Typography
                            variant="h5"
                            color={theme.palette.primary.main}
                            sx={{ fontWeight: 700 }}>
                            {t('historyOfProject')}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            border: `1px solid ${theme.palette.grey[100]}`
                        }}>
                        <Box
                            pl={2}
                            pr={2}
                            sx={{
                                height: '300px',
                                overflowY: 'auto',
                                justifyContent: 'flex-end'
                            }}>
                            {comments && comments.length > 0 ? commentsList() : noComments()}
                        </Box>
                        {getTextField()}
                    </Box>
                </Box>
            )}
        </>
    );
};
