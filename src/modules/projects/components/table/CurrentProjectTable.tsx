import React from 'react';
import { Box, Button, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PINK } from '../../../../theme/palette';
import { fontWeightSemiBold, small2 } from '../../../../theme/typography';
import { Project } from '../../models/Project';
import {
    getProjectPriorityColorFor,
    getProjectPriorityTextColor
} from '../../services/ProjectService';
import { useNavigate } from 'react-router-dom';
import { WRTable } from '../../../../components/WRTable';
import { ProjectCard } from '../../../../components/cards/ProjectCard';

interface CurrentProjectTableProps {
    projects: Project[];
}

export function CurrentProjectTable({ projects }: CurrentProjectTableProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const tableHeaders = [
        t('projectTableHeader'),
        t('clientTableHeader'),
        t('managerTableHeader'),
        t('statusTableHeader'),
        t('priorityTableHeader'),
        ''
    ];

    const tableBody = projects.map((project, index) => {
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
            Boolean(project.client_id?.first_name) || Boolean(project.client_id?.last_name)
                ? `${project.client_id?.first_name} ${project.client_id?.last_name}`
                : '',
            `${project.manager_id?.first_name} ${project.manager_id?.last_name}`,
            project.status_id ? (
                <Box key={index} sx={{ background: PINK.lighter, width: 'max-content' }}>
                    <Typography
                        sx={{
                            ...small2,
                            color: PINK.darker,
                            padding: '4px 8px',
                            fontWeight: fontWeightSemiBold
                        }}>
                        {project.status_id?.name}
                    </Typography>
                </Box>
            ) : (
                <></>
            ),
            project.priority ? (
                <Box
                    key={index}
                    sx={{
                        background: getProjectPriorityColorFor(project.priority),
                        width: 'fit-content'
                    }}>
                    <Typography
                        sx={{
                            ...small2,
                            color: getProjectPriorityTextColor(project.priority),
                            padding: '4px 8px',
                            fontWeight: fontWeightSemiBold
                        }}>
                        {project.priority}
                    </Typography>
                </Box>
            ) : (
                <></>
            ),
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

    return (
        <>
            {isLargeLandscape ? (
                <WRTable headers={tableHeaders} body={tableBody} />
            ) : (
                <Stack marginTop={'24px'} spacing={'24px'}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            title={project.name}
                            status={project.status_id.name}
                            firstName={project.manager_id?.first_name}
                            lastName={project.manager_id.last_name}
                        />
                    ))}
                </Stack>
            )}
        </>
    );
}
