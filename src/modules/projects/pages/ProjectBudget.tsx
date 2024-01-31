import { Box } from '@mui/system';
import React, { useContext } from 'react';
import { BudgetSummary } from '../components/budget/BudgetSummary';
import { BudgetDetails } from '../components/budget/BudgetDetails';
import { ProjectContext } from '../layout/ProjectDetailLayout';

export function ProjectBudget(): React.ReactElement {
    const projectContext = useContext(ProjectContext);
    const project = projectContext?.project;
    if (project) {
        return (
            <Box width={'100%'}>
                {BudgetDetails()}
                {BudgetSummary(project.id)}
            </Box>
        );
    } else {
        return <></>;
    }
}
