import React from 'react';
import { Popover } from '@mui/material';

interface MenuPopoverProps {
    children: React.ReactElement[];
    open: boolean;
    onClose: Function;
}

export function MenuPopover({ children, open, onClose }: MenuPopoverProps): React.ReactElement {
    return (
        <Popover
            open={open}
            onClose={(): void => onClose()}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            anchorEl={null}
            PaperProps={{
                sx: {
                    marginTop: '76px',
                    overflow: 'inherit',
                    width: 200
                }
            }}>
            {children}
        </Popover>
    );
}
