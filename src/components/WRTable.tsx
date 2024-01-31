import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { NEUTRAL } from '../theme/palette';

interface WSTableProps {
    headers: (String | React.ReactElement)[];
    body?: (String | React.ReactElement)[][];
    row?: React.ReactElement[];
    marginTop?: string;
    marginBottom?: string;
    maxHeight?: string;
    removeScroll?: boolean;
}

export function WRTable({
    headers,
    body,
    row,
    marginTop,
    marginBottom,
    maxHeight,
    removeScroll
}: WSTableProps): React.ReactElement {
    const scrollStyle = removeScroll
        ? {
              overflowY: 'auto'
          }
        : {};
    return (
        <Box marginTop={marginTop ?? '32px'} marginBottom={marginBottom ?? '0'}>
            <TableContainer
                sx={{
                    maxHeight: maxHeight ?? 'calc(100vh - 320px)',
                    border: `1px solid ${NEUTRAL.light}`,
                    borderRadius: '4px',
                    borderCollapse: 'unset',
                    overflowY: 'scroll',
                    ...scrollStyle
                }}>
                <Table stickyHeader aria-label="projects table">
                    <TableHead>
                        <TableRow>
                            {headers.map((item, index) => (
                                <TableCell
                                    key={index}
                                    variant={'head'}
                                    sx={{
                                        borderBottom: `1px solid ${NEUTRAL.light}`,
                                        backgroundColor: NEUTRAL.lighter
                                    }}>
                                    {item}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {body &&
                            body.map((items, index) => {
                                return (
                                    <TableRow key={index}>
                                        {items.map((item, count) => (
                                            <TableCell key={count} variant={'body'}>
                                                {item}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        {row &&
                            row.map((item, index) => {
                                return <TableRow key={index}>{item}</TableRow>;
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
