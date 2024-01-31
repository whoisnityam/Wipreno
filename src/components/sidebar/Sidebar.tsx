import React from 'react';
import { Box, Drawer, List, styled, Typography, useTheme } from '@mui/material';
import { ACCENT_SUNSET, NEUTRAL } from '../../theme/palette';
import { small1 } from '../../theme/typography';

// ----------------------------------------------------------------------
const DRAWER_WIDTH = '325px';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
        flexShrink: 0,
        width: DRAWER_WIDTH
    }
}));

// ----------------------------------------------------------------------

interface SidebarProps {
    title: string;
    navConfig: { title: string; path: string; icon: JSX.Element }[];
    selectedItem: { title: string; path: string; icon: JSX.Element };
    handleSelectedItem: Function;
}

export function Sidebar({
    title,
    navConfig,
    selectedItem,
    handleSelectedItem
}: SidebarProps): JSX.Element {
    const theme = useTheme();

    const renderContent: JSX.Element = (
        <Box
            sx={{
                height: '100vh',
                padding: theme.spacing(2, 3, 5),
                display: 'flex',
                flexDirection: 'column'
            }}>
            <Typography mb={2} variant="h4" sx={{ paddingLeft: '40px' }}>
                {title}
            </Typography>
            <List disablePadding sx={{ paddingLeft: '64px' }}>
                {navConfig.map((item, index) => (
                    <Typography
                        variant="h6"
                        mt={3}
                        fontWeight={700}
                        key={index}
                        onClick={(): void => handleSelectedItem(item)}
                        sx={{
                            ...small1,
                            width: 'fit-content',
                            padding: '8px 16px',
                            color:
                                selectedItem.title === item.title
                                    ? NEUTRAL.darker
                                    : theme.palette.grey[200],
                            backgroundColor:
                                selectedItem.title === item.title
                                    ? ACCENT_SUNSET.medium
                                    : theme.palette.background.default,
                            cursor: 'pointer'
                        }}>
                        {item.title}
                    </Typography>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
        </Box>
    );

    return (
        <RootStyle>
            <Drawer
                open
                variant="persistent"
                PaperProps={{
                    sx: {
                        width: DRAWER_WIDTH,
                        bgcolor: 'background.default',
                        marginTop: '81px'
                    }
                }}>
                {renderContent}
            </Drawer>
        </RootStyle>
    );
}
