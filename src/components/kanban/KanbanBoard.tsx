import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { ColumnLayout } from './KanbanInterfaces';
import { Box } from '@mui/material';
import { KanbanDraggable } from './kanbanComponents/KanbanDraggable';
import { ColumnHeader } from './kanbanComponents/ColumnHeader';
import { updateProjectStatus } from '../../modules/projects/services/ProjectService';

const ScrollContainer = styled(Box)({
    display: 'flex',
    maxHeight: 'calc(100vh - 260px)',
    whiteSpace: 'nowrap'
});

const Container = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
});

interface KanbanBoardProps {
    kanbanColumnData: ColumnLayout[];
    setKanbanColumnData: React.Dispatch<React.SetStateAction<ColumnLayout[]>>;
    updateAllProjectsOnProjectUpdate: Function;
}

export function KanbanBoard({
    kanbanColumnData,
    setKanbanColumnData,
    updateAllProjectsOnProjectUpdate
}: KanbanBoardProps): React.ReactElement {
    /**
   * Component to display a Kanban board.
   *
   * @param kanbanColumnData (State) - This contains all the column details i.e. the column ID, the column name, list of items.
   * @example
   * ```
    const projects: Item[] = [
        {
            name: 'Project-1',
            status: 'Découverte',
            assignee: 'NAME HERE'
        },
        {
            name: 'Project-2',
            status: 'Faisabilité',
            assignee: 'Marie Pedro'
        }
    ]
    const kanbanColumnData: ColumnLayout = [
        {
            ColumnID: 'Découverte',
            ColumnName: 'Découverte',
            items: projects
        },
        {
            ColumnID: 'Chantier en cours',
            ColumnName: 'Chantier en cours',
            items: []
        }
    ]
   * ```
   * @param setKanbanColumnData (Corressponding setState) - Callback function to update kanbanColumnData when the positions of the columns are changed.
   * @example
   * ```
    const [kanbanColumnData, setKanbanColumnData] = useState(projectStatus);
   * ```
   * Here, setKanbanColumnData is the callback passed as the second parameter
   *
   * @returns A react Kanban Board component
   *
   */

    const onDragEnd = (result: DropResult): void => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (source.droppableId !== destination.droppableId) {
            const sourceColumnIndex = kanbanColumnData.findIndex(
                (column) => column.ColumnID === source.droppableId
            );
            const destColumnIndex = kanbanColumnData.findIndex(
                (column) => column.ColumnID === destination.droppableId
            );
            if (sourceColumnIndex !== -1 && destColumnIndex !== -1) {
                const sourceItems = [...kanbanColumnData[sourceColumnIndex].items];
                const destItems = [...kanbanColumnData[destColumnIndex].items];
                const [removed] = sourceItems.splice(source.index, 1);
                // Update status to match column
                removed.status = kanbanColumnData[destColumnIndex].ColumnName;

                destItems.splice(destination.index, 0, removed);
                const tempKanbanColumnData = [...kanbanColumnData];
                tempKanbanColumnData[sourceColumnIndex].items = sourceItems;
                tempKanbanColumnData[destColumnIndex].items = destItems;

                // Update status in database
                updateProjectStatus(removed.id, destination.droppableId);

                // Update project in project list
                updateAllProjectsOnProjectUpdate(removed.id, destination.droppableId);

                // Update Kanban board order
                setKanbanColumnData(tempKanbanColumnData);
            }
        } else {
            const columnIndex = kanbanColumnData.findIndex(
                (item) => item.ColumnID === source.droppableId
            );
            if (columnIndex !== -1) {
                const tempKanbanColumnData = [...kanbanColumnData];

                const copiedItems = [...tempKanbanColumnData[columnIndex].items];
                const [removed] = copiedItems.splice(source.index, 1);
                copiedItems.splice(destination.index, 0, removed);

                tempKanbanColumnData[columnIndex].items = copiedItems;

                setKanbanColumnData(tempKanbanColumnData);
            }
        }
    };

    return (
        <ScrollContainer>
            <DragDropContext onDragEnd={(result): void => onDragEnd(result)}>
                {kanbanColumnData.map((column) => {
                    return (
                        <Droppable droppableId={column.ColumnID} key={column.ColumnID}>
                            {(providedDroppable): JSX.Element => {
                                return (
                                    <Container
                                        data-rbd-droppable-id={
                                            providedDroppable.droppableProps[
                                                'data-rbd-droppable-id'
                                            ]
                                        }
                                        data-rbd-droppable-context-id={
                                            providedDroppable.droppableProps[
                                                'data-rbd-droppable-context-id'
                                            ]
                                        }
                                        ref={providedDroppable.innerRef}>
                                        <ColumnHeader
                                            columnName={column.ColumnName}
                                            columnItemCount={column.items.length}
                                        />
                                        <Box height="18px" />
                                        {column.items.map((item, ind) => {
                                            return (
                                                <KanbanDraggable
                                                    providedDroppable={providedDroppable}
                                                    key={item.id}
                                                    item={item}
                                                    index={ind}
                                                />
                                            );
                                        })}
                                        <Box height="100px" />
                                    </Container>
                                );
                            }}
                        </Droppable>
                    );
                })}
            </DragDropContext>
        </ScrollContainer>
    );
}
