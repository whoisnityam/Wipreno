import React from 'react';
import { Box, Button, Divider, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../components/ModalContainer';
import { User } from '../../profile/models/User';
import { Project } from '../../projects/models/Project';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { X } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';
import { postalCheck } from '../../../utils';

interface ClientDetailsModalProps {
    client: User;
    projects: Project[];
    isOpen: boolean;
    onClose: Function;
    onDelete: Function;
    onModify: Function;
}

export function ClientDetailsModal({
    client,
    projects,
    isOpen,
    onClose,
    onDelete,
    onModify
}: ClientDetailsModalProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();

    const CloseSection = (): React.ReactElement => {
        return (
            <Stack position="absolute" top="16px" right="16px">
                <IconButton sx={{ padding: '0px' }} onClick={(): void => onClose()}>
                    <X />
                </IconButton>
            </Stack>
        );
    };

    const ClientSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('client')}</Typography>
                <Box height="12px" />
                <Divider />
                <Box height="12px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.darker} variant="subtitle2">
                            {t('lastName')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.darker}>
                            {`${client.first_name} ${client.last_name}`}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('emailFieldLabel')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.darker}>
                            {client.email}
                        </Typography>
                    </Stack>
                </Stack>
                <Box height="12px" />
                <Stack direction="row" justifyContent="space-between">
                    <Stack width="49%">
                        <Typography color={NEUTRAL.darker} variant="subtitle2">
                            {t('phoneNumber')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.darker}>
                            {client.phone}
                        </Typography>
                    </Stack>
                    <Stack width="49%">
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('address')}
                        </Typography>
                        <Typography
                            sx={{ wordWrap: 'break-word' }}
                            variant="body2"
                            color={NEUTRAL.darker}>
                            {`${client.address ? client.address + ',' : ''} ${
                                client.postal_code ? postalCheck(client.postal_code ?? '') : ''
                            } ${client.city ? client.city : ''}`}
                        </Typography>
                    </Stack>
                </Stack>
            </React.Fragment>
        );
    };

    const ProjectSection = (): React.ReactElement => {
        return (
            <React.Fragment>
                <Typography variant="h6">{t('projet(s)')}</Typography>
                <Box height="12px" />
                <Divider />
                <Box height="12px" />
                {projects.map((project) => (
                    <React.Fragment key={project.id}>
                        <Stack direction="row" justifyContent="space-between">
                            <Stack width="49%">
                                <Typography
                                    color={NEUTRAL.darker}
                                    variant="subtitle2"
                                    sx={{
                                        width: '170px',
                                        maxHeight: '40px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                    {project.name}
                                </Typography>
                                <Box height="8px" />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background:
                                            project.status_id.name === 'Chantier terminé'
                                                ? theme.palette.success.light
                                                : PINK.lighter,
                                        width: 'max-content'
                                    }}>
                                    <Typography
                                        sx={{
                                            ...small2,
                                            color:
                                                project.status_id.name === 'Chantier terminé'
                                                    ? theme.palette.success.dark
                                                    : PINK.darker,
                                            padding: '4px 8px',
                                            fontWeight: fontWeightSemiBold
                                        }}>
                                        {project.status_id.name}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack width="49%" justifyContent="center" alignItems="flex-end">
                                <Button
                                    variant="outlined"
                                    sx={{ width: '125px' }}
                                    onClick={(): void =>
                                        navigate(`/project/details/${project.id}`)
                                    }>
                                    {t('seeNoticeButtonTitle')}
                                </Button>
                            </Stack>
                        </Stack>
                        <Box height="24px" />
                    </React.Fragment>
                ))}
            </React.Fragment>
        );
    };

    const ButtonSection = (): React.ReactElement => {
        return (
            <Stack direction="row">
                <Button sx={{ width: '170px' }} variant="outlined" onClick={(): void => onModify()}>
                    {t('modifyButtonTitle')}
                </Button>
                <Box width="20px" />
                <Button
                    color="error"
                    sx={{ width: '170px' }}
                    variant="outlined"
                    onClick={(): void => onDelete()}>
                    {t('deleteButtonTitle')}
                </Button>
            </Stack>
        );
    };

    const renderClientDetailsModal = (): React.ReactElement => {
        return (
            <Stack>
                <CloseSection />
                <Typography variant="h4" color={NEUTRAL.darker} textAlign="center">
                    {t('customerDetails')}
                </Typography>
                <Box height="40px" />
                <ClientSection />
                <Box height="32px" />
                <ProjectSection />
                <Box height="24px" />
                <ButtonSection />
            </Stack>
        );
    };

    return (
        <ModalContainer
            onClose={(): void => {
                onClose();
            }}
            isModalOpen={isOpen}
            content={renderClientDetailsModal()}
        />
    );
}
