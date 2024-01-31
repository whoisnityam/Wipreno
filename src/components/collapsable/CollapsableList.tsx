import React from 'react';
import { Box, Divider, Stack } from '@mui/material';

interface CollapsableListProps {
    spacing?: string;
    showDivider?: boolean;
    children?: React.ReactNode[];
}

export function CollapsableList({
    spacing,
    showDivider,
    children
}: CollapsableListProps): React.ReactElement {
    return (
        <Stack spacing={spacing ?? '16px'} marginTop={'32px'} marginBottom={'40px'}>
            {children?.map((child, index) => (
                <Box key={index}>
                    {child}
                    {showDivider ? <Divider /> : <></>}
                </Box>
            ))}
        </Stack>
    );
}
