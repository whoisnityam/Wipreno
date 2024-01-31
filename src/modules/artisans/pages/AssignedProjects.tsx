import React, { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { AssignedProjectTable } from '../components/AssignedProjectTable';
import { Project } from '../../projects/models/Project';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../theme/palette';
import { getProjectsByArtisanId } from '../services/artisanService';

export function AssignedProjects(): React.ReactElement {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [artisanId, setArtisanId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { id } = useParams();
    const { t } = useTranslation();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        if (id) {
            setArtisanId(id);
        }
    }, [id]);

    const fetchLotsDetails = async (): Promise<void> => {
        if (artisanId) {
            setLoading(true);
            const res = await getProjectsByArtisanId(artisanId);
            setAllProjects(res);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (artisanId !== '') {
            fetchLotsDetails();
        }
    }, [artisanId]);

    const ProjectList = (): React.ReactElement => {
        return (
            <Box>
                <AssignedProjectTable key={'list'} projects={allProjects} />
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (allProjects.length === 0) {
            return (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            height: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                        <Box marginTop={'81px'}>
                            <Typography variant={isLarge ? 'h3' : 'h5'} color={NEUTRAL.light}>
                                {t('viewNotAvailableAssignedProjecttitle')}
                            </Typography>
                        </Box>
                    </Box>
                </>
            );
        } else {
            return <>{ProjectList()} </>;
        }
    };

    return <>{RenderComponents()}</>;
}
