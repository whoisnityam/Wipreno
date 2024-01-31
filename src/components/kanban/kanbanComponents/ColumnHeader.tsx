import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
// import { MoreHorizontal } from 'react-feather';

interface ColumnHeaderProps {
    columnName: string;
    columnItemCount: number;
}

export function ColumnHeader({
    columnName,
    columnItemCount
}: ColumnHeaderProps): React.ReactElement {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                width: '305px',
                justifyContent: 'space-between'
            }}>
            <Typography
                color={theme.palette.grey[200]}
                variant="subtitle1">{`${columnName} (${columnItemCount})`}</Typography>
            {/*<Box><MoreHorizontal color={theme.palette.grey[200]} /> </Box>*/}
        </Box>
    );
}
