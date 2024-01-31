import React from 'react';
import { Box, styled } from '@mui/material';
import { Draggable, DroppableProvided } from 'react-beautiful-dnd';
import { Item } from '../KanbanInterfaces';
import { KanbanProjectItem } from './KanbanProjectItem';
import { useNavigate } from 'react-router-dom';

const ProjectItemBox = styled(Box)(({ theme }) => ({
    margin: '0px 10px 18px 10px',
    width: '305px',
    maxHeight: '172px',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    background: theme.palette.background.default,
    borderRadius: '4px'
}));

interface KanbanDraggableProps {
    providedDroppable: DroppableProvided;
    index: number;
    item: Item;
}

export function KanbanDraggable({
    providedDroppable,
    index,
    item
}: KanbanDraggableProps): React.ReactElement {
    const navigate = useNavigate();

    return (
        <Draggable draggableId={item.id} index={index}>
            {(providedDraggable): JSX.Element => {
                return (
                    <ProjectItemBox
                        onClick={(): void => navigate(`/project/details/${item.id}`)}
                        ref={providedDraggable.innerRef}
                        // draggableProps
                        style={providedDraggable.draggableProps.style}
                        data-rbd-draggable-id={
                            providedDraggable.draggableProps['data-rbd-draggable-id']
                        }
                        data-rbd-draggable-context-id={
                            providedDraggable.draggableProps['data-rbd-draggable-context-id']
                        }
                        onTransitionEnd={providedDraggable.draggableProps.onTransitionEnd}
                        // dragHandleProps
                        data-rbd-drag-handle-draggable-id={
                            providedDraggable.dragHandleProps?.['data-rbd-drag-handle-draggable-id']
                        }
                        aria-describedby={providedDraggable.dragHandleProps?.['aria-describedby']}
                        data-rbd-drag-handle-context-id={
                            providedDraggable.dragHandleProps?.['data-rbd-drag-handle-context-id']
                        }
                        draggable={providedDraggable.dragHandleProps?.draggable}
                        onDragStart={providedDraggable.dragHandleProps?.onDragStart}
                        role={providedDraggable.dragHandleProps?.role}
                        tabIndex={providedDraggable.dragHandleProps?.tabIndex}>
                        <KanbanProjectItem
                            assignee={item.assignee}
                            name={item.name}
                            status={item.status}
                        />
                        {providedDroppable.placeholder}
                    </ProjectItemBox>
                );
            }}
        </Draggable>
    );
}
