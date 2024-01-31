import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../components/ModalContainer';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { getProjectsByArtisanId } from '../services/AdminArtisanService';

interface ArtisanDetailsModalProps {
    artisan: User;
    isOpen: boolean;
    onClose: Function;
    professionList: string[];
}

export function ArtisanDetailsModal({
    artisan,
    professionList,
    isOpen,
    onClose
}: ArtisanDetailsModalProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const [projectList, setProjectList] = useState<Project[]>();

    const fetchProjectDetails = async (): Promise<void> => {
        if (artisan && artisan.id) {
            const data = await getProjectsByArtisanId(artisan.artisan_id.id);
            setProjectList(data);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, []);

    const TitleCloseSection = (): React.ReactElement => {
        return (
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h4" color={NEUTRAL.dark} textAlign="center">
                    {t('craftsmanDetails')}
                </Typography>
                <IconButton sx={{ padding: '0px' }} onClick={(): void => onClose()}>
                    <X color={theme.palette.primary.medium} />
                </IconButton>
            </Stack>
        );
    };

    const ProfileSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('profile')}</Typography>
                <Box height="16px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('lastName')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {`${artisan.first_name} ${artisan.last_name}`}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('enterprise')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {artisan.company_name}
                        </Typography>
                    </Stack>
                </Stack>
                <Box height="20px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('ProfessionTableHeader')}
                        </Typography>
                        <Box height="4px" />
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-start'
                            }}>
                            {professionList.map((professionItem, index) => {
                                return (
                                    <Box marginRight="8px" marginBottom="8px" key={index}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                background: PINK.lighter,
                                                width: 'fit-content'
                                            }}>
                                            <Typography
                                                sx={{
                                                    ...small2,
                                                    color: PINK.darker,
                                                    padding: '4px 8px',
                                                    fontWeight: fontWeightSemiBold
                                                }}>
                                                {professionItem}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('Department')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {artisan.artisan_id.department}
                        </Typography>
                    </Stack>
                </Stack>
            </React.Fragment>
        );
    };

    const ContactSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('contactInformation')}</Typography>
                <Box height="18px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('emailFieldLabel')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {artisan.email}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('phoneNumber')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {artisan.phone}
                        </Typography>
                    </Stack>
                </Stack>
            </React.Fragment>
        );
    };

    const InvitationSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('invitation')}</Typography>
                <Box height="18px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.dark} variant="subtitle2">
                            {t('invitedBy')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {artisan.artisan_id.created_by.enterprises?.at(0)?.enterprise_id.name}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.dark}>
                            {t('aboutTheProject')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.dark}>
                            {projectList && projectList?.map((project) => project.name).join(', ')}
                        </Typography>
                    </Stack>
                </Stack>
            </React.Fragment>
        );
    };

    const renderArtisanDetailsModal = (): React.ReactElement => {
        return (
            <Stack>
                <TitleCloseSection />
                <Box height="40px" />
                <ProfileSection />
                <Box height="42px" />
                <ContactSection />
                <Box height="40px" />
                <InvitationSection />
            </Stack>
        );
    };

    return (
        <ModalContainer
            width="550px"
            onClose={(): void => {
                onClose();
            }}
            isModalOpen={isOpen}
            content={renderArtisanDetailsModal()}
        />
    );
}
