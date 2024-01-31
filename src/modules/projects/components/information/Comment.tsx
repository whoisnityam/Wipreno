import { Avatar, Box, Stack, Typography, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { small2 } from '../../../../theme/typography';
import { stringAvatar } from '../../../../utils';
import { Comments } from '../../models/Comments';
import { deleteCommentsByProjectId } from '../../services/CommentService';

interface CommentProps {
    row: Comments;
    reload: Function;
}
export const Comment = ({ row, reload = (): void => {} }: CommentProps): React.ReactElement => {
    const [style, setStyle] = useState({ display: 'none' });
    const { t } = useTranslation();
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const handleDelete = async (): Promise<void> => {
        if (row) {
            setOpenDeleteAlert(false);
            await deleteCommentsByProjectId(row.id);
            reload();
        }
    };

    if (isLargeLandscape) {
        return (
            <Stack
                alignItems={'flex-end'}
                onMouseEnter={(): void => {
                    setStyle({ display: 'block' });
                }}
                onMouseLeave={(): void => {
                    setStyle({ display: 'none' });
                }}>
                <Box
                    sx={{
                        ...style,
                        position: 'relative',
                        zIndex: 1
                    }}>
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
                            top: '7px',
                            left: '-70px'
                        }}
                        onClick={async (): Promise<void> => {
                            setOpenDeleteAlert(true);
                        }}
                    />
                </Box>

                <Box
                    mt={2}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}>
                    <Typography
                        p={2}
                        ml={2}
                        variant="body1"
                        color={ACCENT_SUNSET.darker}
                        sx={{
                            fontWeight: 400,
                            backgroundColor: ACCENT_SUNSET.lighter,
                            borderRadius: '8px 8px 8px 0px',
                            maxWidth: '85%',
                            overflowWrap: 'break-word'
                        }}>
                        {row.comment}
                    </Typography>
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
                    <Alert
                        width="440px"
                        title={t('doYouWantToDeleteCommentTitle')}
                        subtitle={t('doYouWantToDeleteCommentSubtitle')}
                        open={openDeleteAlert}
                        onClick={(): Promise<void> => handleDelete()}
                        onSecondaryButtonClick={(): void => {
                            setOpenDeleteAlert(false);
                            setStyle({ display: 'none' });
                        }}
                        onClose={(): void => {
                            setOpenDeleteAlert(false);
                            setStyle({ display: 'none' });
                        }}
                        primaryButton={t('remove')}
                        primaryButtonType="error"
                        secondaryButton={t('toCancel')}
                        secondaryButtonType={'text'}
                    />
                </Box>
            </Stack>
        );
    } else {
        return (
            <Stack alignItems={'flex-end'}>
                <Box
                    mt={2}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}>
                    <Typography
                        p={2}
                        ml={2}
                        variant="body1"
                        color={ACCENT_SUNSET.darker}
                        sx={{
                            fontWeight: 400,
                            backgroundColor: ACCENT_SUNSET.lighter,
                            borderRadius: '8px 8px 8px 0px',
                            maxWidth: '85%',
                            overflowWrap: 'break-word'
                        }}>
                        {row.comment}
                    </Typography>
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
            </Stack>
        );
    }
};
