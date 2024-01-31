import React, { ReactElement } from 'react';
import { Box, Card, CardContent, SxProps, useTheme } from '@mui/material';
import emptyYellowFolder from '../../../assets/emptyYellowFolder.svg';
import emptyBlueFolder from '../../../assets/emptyBlueFolder.svg';

interface BannerProps {
    sx?: SxProps;
    children: ReactElement[] | ReactElement;
    noPadding?: Boolean;
    showIcon?: Boolean;
    icon?: 'BLUE' | 'YELLOW';
    direction?: 'row' | 'column';
}

export function DashboardCards({
    sx,
    children,
    noPadding,
    icon,
    direction = 'row'
}: BannerProps): React.ReactElement {
    const theme = useTheme();

    return (
        <Card
            sx={{
                padding: noPadding ? '0' : '2%',
                background: theme.palette.primary.contrastText,
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                ...sx
            }}>
            <CardContent
                sx={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: direction
                }}>
                {icon ? (
                    <Box
                        component={'img'}
                        src={icon === 'BLUE' ? emptyBlueFolder : emptyYellowFolder}
                        alt="folder"
                        style={{ width: '50px', height: '50px' }}
                    />
                ) : (
                    <></>
                )}

                {children}
            </CardContent>
        </Card>
    );
}
