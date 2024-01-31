import { Box, Dialog, Slide, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useState } from 'react';
import { ProjectComments } from '../components/information/ProjectComments';
import { ProjectInformation } from '../components/information/ProjectInformation';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { useTranslation } from 'react-i18next';
import { Maximize2 } from 'react-feather';
import { UserContext } from '../../../provider/UserProvider';
import { Role } from '../../profile/models/Role';

export function ProjectDetails(): React.ReactElement {
    const project = useContext(ProjectContext)?.project;
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery('(min-width:920px)');
    const [historyOpen, setHistoryOpen] = useState(false);
    const user = useContext(UserContext);

    const handleClose = (): void => {
        setHistoryOpen(false);
    };

    if (project) {
        if (user.user?.role.name === Role.artisan || user.user?.role.name === Role.client) {
            return (
                <>
                    <Stack direction="row" sx={{ width: '100%' }}>
                        <ProjectInformation project={project} />
                    </Stack>
                </>
            );
        } else {
            return (
                <>
                    {!isLarge && (
                        <>
                            <Slide direction="up" in={historyOpen}>
                                <Dialog
                                    open={historyOpen}
                                    keepMounted
                                    onClose={handleClose}
                                    aria-describedby="alert-dialog-history-of-project"
                                    sx={{
                                        '.MuiDialog-paper': {
                                            minHeight: 'calc(100% - 40px)',
                                            maxHeight: 'calc(100% - 40px)',
                                            minWidth: '100%',
                                            maxWidth: '100%',
                                            margin: 'unset',
                                            marginTop: '40px'
                                        }
                                    }}>
                                    <ProjectComments projectId={project.id} onClose={handleClose} />
                                </Dialog>
                            </Slide>
                            <Stack
                                sx={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    marginBottom: '40px'
                                }}
                                spacing={'40px'}>
                                <ProjectInformation project={project} />
                                <Stack
                                    direction={'row'}
                                    sx={{
                                        width: '100%',
                                        background: theme.palette.grey['50'],
                                        padding: '16px',
                                        justifyContent: 'space-between',
                                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onClick={(): void => setHistoryOpen(true)}>
                                    <Typography variant={'h6'}>{t('historyOfProject')}</Typography>
                                    <Maximize2 />
                                </Stack>
                            </Stack>
                        </>
                    )}
                    {isLarge && (
                        <Stack
                            direction="row"
                            sx={{ width: '100%', justifyContent: 'space-between' }}>
                            <Box sx={{ width: '49%' }}>
                                <ProjectInformation project={project} />
                            </Box>
                            <Box sx={{ width: '49%' }}>
                                <ProjectComments projectId={project.id} />
                            </Box>
                        </Stack>
                    )}
                </>
            );
        }
    } else {
        return <></>;
    }
}
