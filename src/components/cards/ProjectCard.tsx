import React from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ACCENT_SUNSET, NEUTRAL, PINK } from '../../theme/palette';
import { body3, small2 } from '../../theme/typography';
import { stringAvatar } from '../../utils';
import { useNavigate } from 'react-router-dom';

export const ProjectCard = ({
    id,
    title,
    status,
    firstName,
    lastName,
    width
}: {
    id: string;
    title: string;
    status: string;
    firstName: string;
    lastName: string;
    width?: string;
}): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const style = width
        ? {
              width,
              marginRight: '20px',
              marginBottom: '20px'
          }
        : {};
    return (
        <Card
            sx={{
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                ...style
            }}
            onClick={(): void => navigate(`/project/details/${id}`)}>
            <CardContent>
                <Stack spacing={'20px'}>
                    <Divider
                        color={ACCENT_SUNSET.medium}
                        sx={{ width: '20px', borderBottomWidth: '2px' }}
                    />
                    <Stack spacing={'10px'}>
                        <Typography
                            variant={'h5'}
                            color={NEUTRAL.dark}
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                            {title}
                        </Typography>
                        <Box>
                            <Typography
                                sx={{
                                    ...small2,
                                    color:
                                        status === 'Chantier terminé'
                                            ? theme.palette.success.dark
                                            : PINK.darker,
                                    backgroundColor:
                                        status === 'Chantier terminé'
                                            ? theme.palette.success.light
                                            : PINK.lighter,
                                    padding: '4px 8px',
                                    width: 'fit-content'
                                }}>
                                {status}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack spacing={'10px'}>
                        <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                            {t('projectManager')}
                        </Typography>
                        <Stack direction={'row'} alignItems={'center'} spacing={'10px'}>
                            <Avatar
                                sx={{
                                    background: ACCENT_SUNSET.lighter,
                                    color: ACCENT_SUNSET.darker
                                }}>
                                <Typography sx={{ ...body3, fontWeight: 700 }}>
                                    {stringAvatar(firstName, lastName)}
                                </Typography>
                            </Avatar>
                            <Typography variant={'body2'} color={NEUTRAL.medium}>{`${
                                firstName ?? ''
                            } ${lastName ?? ''}`}</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};
