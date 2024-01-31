import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Drawer, styled, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    projectManagerNavigation,
    adminNavigation,
    accountPopoverConfig,
    projectManagerNavigationResponsive
} from './DrawerItems';
import { NavSection } from './NavSection';
import { Header } from './Header';
import { Scrollbar } from './Scrollbar';
import { Role } from '../../modules/profile/models/Role';
import { UserContext } from '../../provider/UserProvider';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
        display: 'none'
    }
}));

interface SidebarProps {
    isOpenSidebar: boolean;
    onCloseSidebar: Function;
    onOpenSidebar: Function;
    isAccountPopover: boolean;
    closeAccountPopover: Function;
}

export function Sidebar({
    isOpenSidebar,
    onCloseSidebar,
    onOpenSidebar,
    isAccountPopover,
    closeAccountPopover
}: SidebarProps): JSX.Element {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const user = useContext(UserContext);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    useEffect(() => {
        if (isAccountPopover && !isOpenSidebar) {
            closeAccountPopover();
        }
    }, [isOpenSidebar]);

    useEffect(() => {
        if (isOpenSidebar) {
            onCloseSidebar();
        }
    }, [pathname]);

    const getNavigationItems = (): { title: string; path: string }[] => {
        if (user.user?.role.name === Role.admin) {
            return adminNavigation(t);
        } else if (user.user?.role.name === Role.projectManager) {
            if (isLargeLandscape) {
                return projectManagerNavigation(t);
            } else {
                return projectManagerNavigationResponsive(t);
            }
        } else {
            return [];
        }
    };

    const renderContent: JSX.Element = (
        <Scrollbar
            sx={{
                height: '100%',
                '& .simplebar-content': { height: '100%', display: 'flex', flexDirection: 'column' }
            }}>
            <Header
                onOpenSidebar={onOpenSidebar}
                isOpenSidebar={isOpenSidebar}
                onCloseSidebar={onCloseSidebar}
            />
            <NavSection
                navConfig={isAccountPopover ? accountPopoverConfig(t) : getNavigationItems()}
            />
            <Box sx={{ flexGrow: 1 }} />
        </Scrollbar>
    );

    return (
        <RootStyle>
            {!isLarge && (
                <Drawer
                    anchor="top"
                    open={isOpenSidebar}
                    onClose={(): void => onCloseSidebar()}
                    PaperProps={{
                        sx: { width: '100%', minHeight: '10vh' }
                    }}>
                    {renderContent}
                </Drawer>
            )}
        </RootStyle>
    );
}
