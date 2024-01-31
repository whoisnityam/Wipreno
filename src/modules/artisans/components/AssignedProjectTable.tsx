import React from 'react';
import { Box, Button, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';
import { WRTable } from '../../../components/WRTable';
import { Project } from '../../projects/models/Project';
import {
    getProjectStatusColorFor,
    getProjectStatusTextColor
} from '../services/assignedProjectService';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../../../components/cards/ProjectCard';

interface AssignedProjectTableProps {
    projects: Project[];
}

export function AssignedProjectTable({ projects }: AssignedProjectTableProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const tableHeaders = [
        t('projectName'),
        t('clientTableHeader'),
        t('managerTableHeader'),
        t('projectLocationTableHeader'),
        t('statusTableHeader'),
        ''
    ];

    const data = projects;
    const uniqueProject: Project[] = [];
    data.filter(function (item) {
        const i = uniqueProject.findIndex((x) => x.id === item.id);
        if (i <= -1) {
            uniqueProject.push({ ...item });
        }
        return null;
    });

    const tableBody = uniqueProject.map((project, index) => {
        return [
            <Box key={index}>
                <Typography
                    variant="body2"
                    sx={{
                        maxWidth: '300px',
                        maxHeight: '40px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: '2'
                    }}>
                    {project.name}
                </Typography>
            </Box>,
            `${project.client_id?.first_name} ${project.client_id?.last_name}`,
            `${project.manager_id?.first_name} ${project.manager_id?.last_name}`,
            `${project.city}`,
            <Box
                key={index}
                sx={{
                    background: getProjectStatusColorFor(project.status_id.name),
                    width: 'max-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: getProjectStatusTextColor(project.status_id.name),
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold
                    }}>
                    {project.status_id?.name}
                </Typography>
            </Box>,
            <Button
                key={index}
                variant={'outlined'}
                color={'secondary'}
                fullWidth
                sx={{ width: '147px' }}
                onClick={(): void => navigate(`/project/details/${project.id}`)}>
                {t('seeNoticeButtonTitle')}
            </Button>
        ];
    });

    const responsiveTable = (): React.ReactElement[] => {
        return uniqueProject.map((project, index) => {
            return (
                <Stack key={index} spacing={'24px'} mt={3}>
                    <ProjectCard
                        key={index}
                        id={project.id}
                        title={project.name}
                        status={project.status_id.name}
                        firstName={project.manager_id?.first_name}
                        lastName={project.manager_id.last_name}
                    />
                </Stack>
            );
        });
    };

    return (
        <>
            {isLargeLandscape ? (
                <WRTable headers={tableHeaders} body={tableBody} />
            ) : (
                responsiveTable()
            )}
        </>
    );
}
