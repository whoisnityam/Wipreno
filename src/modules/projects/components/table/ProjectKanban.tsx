import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '../../../../components/kanban/KanbanBoard';
import { Project } from '../../models/Project';
import { ColumnLayout } from '../../../../components/kanban/KanbanInterfaces';
import { Box } from '@mui/material';

interface ProjectKanbanProps {
    status: { id: string; value: string }[];
    allProjects: Project[];
    updateAllProjectsOnProjectUpdate: Function;
}

export function ProjectKanban({
    status = [],
    allProjects = [],
    updateAllProjectsOnProjectUpdate
}: ProjectKanbanProps): React.ReactElement {
    const [kanbanColumnData, setKanbanColumnData] = useState<ColumnLayout[]>([]);

    useEffect(() => {
        if (kanbanColumnData.length === 0 && allProjects && status) {
            const tempKanbanColumnData: ColumnLayout[] = [];
            status.map((item) => {
                const projects = allProjects
                    .filter((proj) => proj.status_id.id === item.id)
                    .map((proj) => {
                        return {
                            id: proj.id,
                            name: proj.name,
                            status: proj.status_id.name,
                            assignee: `${proj.manager_id.first_name} ${proj.manager_id.last_name}`
                        };
                    });
                tempKanbanColumnData.push({
                    ColumnID: item.id,
                    ColumnName: item.value,
                    items: projects
                });
            });
            if (tempKanbanColumnData) {
                setKanbanColumnData(tempKanbanColumnData);
            }
        }
    }, [kanbanColumnData]);

    return (
        <Box
            paddingTop={'32px'}
            sx={{
                maxHeight: 'calc(100vh - 245px)',
                maxWidth: 'calc(100vw - 441px)',
                overflowY: 'auto',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
            }}>
            <KanbanBoard
                kanbanColumnData={kanbanColumnData}
                setKanbanColumnData={setKanbanColumnData}
                updateAllProjectsOnProjectUpdate={updateAllProjectsOnProjectUpdate}
            />
        </Box>
    );
}
