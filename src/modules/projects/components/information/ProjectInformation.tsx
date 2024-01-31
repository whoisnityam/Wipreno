import React, { useContext } from 'react';
import { Avatar, Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Calendar, PieChart } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Project } from '../../models/Project';
import {
    getProjectPriorityColorFor,
    getProjectPriorityTextColor
} from '../../services/ProjectService';
import { ACCENT_SUNSET, NEUTRAL, PINK } from '../../../../theme/palette';
import { StatusOfClient } from '../../../../constants';
import { FONT_PRIMARY, fontWeightSemiBold, label, small2 } from '../../../../theme/typography';
import { UserContext } from '../../../../provider/UserProvider';
import { Role } from '../../../profile/models/Role';
import { convertToUiValue, postalCheck, stringAvatar } from '../../../../utils';

interface ProjectInformationProps {
    project: Project;
}

export function ProjectInformation({ project }: ProjectInformationProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery('(min-width:920px)');
    const user = useContext(UserContext);

    const formatDate = (startDate: Date): string => {
        const date = new Date(startDate);
        return date.toLocaleDateString('en-GB');
    };

    const isClientExist = project.client_id !== null;

    const Projectdetails = (): React.ReactElement => {
        return (
            <Box>
                <Typography variant="h5" color={theme.palette.primary.medium}>
                    {t('projectDetails')}
                </Typography>
                <Box
                    mt={3}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                        justifyContent: 'space-between'
                    }}>
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '100%', md: '47%' }
                        }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('projectName')}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={NEUTRAL.medium}
                            sx={{
                                maxWidth: '310px',
                                maxHeight: '45px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {project.name}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: '47%',
                            [theme.breakpoints.down('sm')]: {
                                width: '100%',
                                marginTop: '24px'
                            }
                        }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('projectManager')}
                        </Typography>
                        <Stack direction="row" alignItems="center" color={NEUTRAL.medium}>
                            <Avatar
                                sx={{
                                    background: ACCENT_SUNSET.lighter,
                                    color: ACCENT_SUNSET.darker,
                                    width: '32px',
                                    height: '32px'
                                }}>
                                <Typography sx={{ ...small2 }}>
                                    {stringAvatar(
                                        project.manager_id.first_name,
                                        project.manager_id.last_name
                                    )}
                                </Typography>
                            </Avatar>
                            <Typography
                                variant="body2"
                                style={{
                                    marginLeft: '5%'
                                }}>{`${project.manager_id.first_name} ${project.manager_id.last_name}`}</Typography>
                        </Stack>
                    </Box>
                </Box>
                <Stack mt={3} direction="row" justifyContent="space-between">
                    <Box sx={{ width: '47%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mb={2}>
                            {t('priority')}
                        </Typography>
                        {project.priority ? (
                            <Typography
                                p={1}
                                sx={{
                                    ...label,
                                    background: getProjectPriorityColorFor(project.priority),
                                    color: getProjectPriorityTextColor(project.priority),
                                    display: 'inline-block'
                                }}>
                                {project.priority}
                            </Typography>
                        ) : (
                            <></>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: '47%'
                        }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mb={2}>
                            {t('progressStatus')}
                        </Typography>
                        <Typography
                            p={1}
                            sx={{
                                ...label,
                                color:
                                    project.status_id.name === 'Chantier terminé'
                                        ? theme.palette.success.dark
                                        : PINK.darker,
                                backgroundColor:
                                    project.status_id.name === 'Chantier terminé'
                                        ? theme.palette.success.light
                                        : PINK.lighter,
                                display: 'inline-block'
                            }}>
                            {project.status_id.name}
                        </Typography>
                    </Box>
                </Stack>
                <Box mt={3}>
                    <Typography variant="subtitle2" color={NEUTRAL.darker} mt={2}>
                        {t('workDescription')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color={NEUTRAL.medium}
                        sx={{ wordBreak: 'break-word' }}>
                        {project.description}
                    </Typography>
                </Box>
                <Typography
                    mt={'40px'}
                    variant="h6"
                    color={theme.palette.primary.medium}
                    fontWeight={fontWeightSemiBold}>
                    {t('estimations')}
                </Typography>
                <Stack
                    mt={'16px'}
                    direction={{ xs: 'column', sm: 'column', md: 'row' }}
                    spacing={{ xs: '20px', sm: '20px' }}
                    sx={{
                        justifyContent: 'space-between'
                    }}>
                    <Box sx={{ width: { sm: '100%', md: '47%' } }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('budget')}
                        </Typography>
                        <Stack direction="row" alignItems="center">
                            <PieChart
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '10px',
                                    color: NEUTRAL.medium
                                }}
                            />
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {convertToUiValue(project.budget)} {t('euroIcon')}
                            </Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: '100%', md: '47%' } }}>
                        <Typography
                            variant="subtitle2"
                            color={NEUTRAL.darker}
                            sx={{ wordBreak: 'break-word' }}>
                            {t('startOfWorkEnvisaged')}
                        </Typography>
                        <Stack direction="row" alignItems="center">
                            <Calendar
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '10px',
                                    color: NEUTRAL.medium
                                }}
                            />
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {project.start_date ? formatDate(project.start_date) : ''}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
                <Typography
                    mt={'42px'}
                    variant="h5"
                    color={theme.palette.primary.medium}
                    fontWeight={fontWeightSemiBold}>
                    {t('customerDetails')}
                </Typography>
                <Stack
                    mt={'16px'}
                    direction={{ xs: 'column', sm: 'column', md: 'row' }}
                    spacing={{ xs: '20px', sm: '20px' }}
                    justifyContent="space-between">
                    <Box sx={{ width: { sm: '100%', md: '47%' } }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('lastName')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {isClientExist
                                ? `${project.client_id!.first_name} ${project.client_id!.last_name}`
                                : ''}
                        </Typography>
                    </Box>
                    {isLarge && (
                        <Box sx={{ width: { sm: '100%', md: '47%' } }}>
                            <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                {t('status')}
                            </Typography>
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {isClientExist
                                    ? project.client_id!.company_name === ''
                                        ? StatusOfClient[0]
                                        : t('professional')
                                    : ''}
                            </Typography>
                        </Box>
                    )}
                    {!isLarge && (
                        <Stack mt={3} direction="row" justifyContent="space-between">
                            <Box sx={{ width: '47%' }}>
                                <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                    {t('status')}
                                </Typography>
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {isClientExist
                                        ? project.client_id!.company_name === ''
                                            ? StatusOfClient[0]
                                            : t('professional')
                                        : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '47%' }}>
                                <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                    {t('enterprise')}
                                </Typography>
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {isClientExist
                                        ? project.client_id!.enterprises.at(0)!.enterprise_id.name
                                        : ''}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </Stack>
                <Stack mt={3} direction="row" justifyContent="space-between">
                    {isLarge && (
                        <Box sx={{ sm: '100%', md: '47%' }}>
                            <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                {t('enterprise')}
                            </Typography>
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {isClientExist
                                    ? project.client_id!.enterprises.at(0)!.enterprise_id.name
                                    : ''}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ width: '47%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('emailField')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {isClientExist ? project.client_id!.email : ''}
                        </Typography>
                    </Box>
                </Stack>
                <Stack
                    mt={3}
                    direction={{ xs: 'column', sm: 'column', md: 'row' }}
                    spacing={{ xs: '20px', sm: '20px' }}
                    justifyContent="space-between">
                    <Box sx={{ width: { sm: '100%', md: '47%' } }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('phoneNumber')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {isClientExist ? project.client_id!.phone : ''}
                        </Typography>
                    </Box>
                    <Box sx={{ width: { sm: '100%', md: '47%' } }}>
                        <Typography
                            variant="subtitle2"
                            fontFamily={FONT_PRIMARY}
                            color={NEUTRAL.darker}>
                            {t('projectAddress')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {isClientExist
                                ? `${project.address}, \n${postalCheck(
                                      project.postal_code ?? ''
                                  )} ${project.city}`
                                : ''}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        );
    };
    const ProjectdetailsForArtisanClient = (): React.ReactElement => {
        return (
            <Stack
                width={'100%'}
                direction={isLarge ? 'row' : 'column'}
                justifyContent={'flex-start'}
                spacing={isLarge ? '24px' : '40px'}
                mb={1}>
                <Stack width={isLarge ? '45%' : '100%'} spacing={isLarge ? '24px' : '16px'}>
                    <Typography variant={'h6'} color={theme.palette.primary.medium}>
                        {t('projectDetails')}
                    </Typography>
                    <Stack
                        direction={isLarge ? 'row' : 'column'}
                        spacing={isLarge ? '20%' : '24px'}>
                        <Box>
                            <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                {t('projectName')}
                            </Typography>
                            <Typography
                                variant="body2"
                                color={NEUTRAL.medium}
                                sx={{
                                    maxWidth: '310px',
                                    maxHeight: '45px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                {project.name}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontFamily={FONT_PRIMARY}
                                color={NEUTRAL.darker}>
                                {t('projectAddress')}
                            </Typography>
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {isClientExist
                                    ? `${project.address}, \n${project.postal_code} ${project.city}`
                                    : ''}
                            </Typography>
                        </Box>
                    </Stack>
                    <Box>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mt={2}>
                            {t('workDescription')}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={NEUTRAL.medium}
                            sx={{ wordBreak: 'break-word', width: '80%' }}>
                            {project.description}
                        </Typography>
                    </Box>
                    <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mb={1}>
                            {t('status')}
                        </Typography>
                        <Typography
                            p={1}
                            sx={{
                                ...label,
                                color:
                                    project.status_id.name === 'Chantier terminé'
                                        ? theme.palette.success.dark
                                        : PINK.darker,
                                backgroundColor:
                                    project.status_id.name === 'Chantier terminé'
                                        ? theme.palette.success.light
                                        : PINK.lighter,
                                display: 'inline-block'
                            }}>
                            {project.status_id.name}
                        </Typography>
                    </Box>
                </Stack>
                <Stack width={isLarge ? '55%' : '100%'}>
                    <Typography variant={'h6'} color={theme.palette.primary.medium}>
                        {t('projectManagerDetails')}
                    </Typography>
                    <Stack
                        direction={isLarge ? 'row' : 'column'}
                        justifyContent={'space-between'}
                        sx={{ marginTop: '16px' }}
                        spacing={'24px'}
                        width={isLarge ? '80%' : '100%'}>
                        <Box
                            sx={{
                                width: isLarge ? '40%' : '100%'
                            }}>
                            <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                {t('projectManager')}
                            </Typography>
                            <Stack direction="row" alignItems="center" color={NEUTRAL.medium}>
                                <Avatar
                                    sx={{
                                        background: ACCENT_SUNSET.lighter,
                                        color: ACCENT_SUNSET.darker,
                                        width: '32px',
                                        height: '32px'
                                    }}>
                                    <Typography sx={{ ...small2 }}>
                                        {stringAvatar(
                                            project.manager_id.first_name,
                                            project.manager_id.last_name
                                        )}
                                    </Typography>
                                </Avatar>
                                <Typography
                                    variant="body2"
                                    style={{
                                        marginLeft: '5%'
                                    }}>{`${project.manager_id.first_name} ${project.manager_id.last_name}`}</Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                            <Typography variant="subtitle2" color={NEUTRAL.darker}>
                                {t('emailField')}
                            </Typography>
                            <Typography variant="body2" color={NEUTRAL.medium}>
                                {project ? project.manager_id.email : ''}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Stack>
        );
    };
    if (user.user?.role.name === Role.artisan || user.user?.role.name === Role.client) {
        return <>{ProjectdetailsForArtisanClient()}</>;
    } else {
        return <Box>{Projectdetails()}</Box>;
    }
}
