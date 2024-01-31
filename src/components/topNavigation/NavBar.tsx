import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './NavigationDrawer';
import { Theme, useMediaQuery } from '@mui/material';

interface NavbarProps {
    hasBackButton?: boolean;
    onBackClick?: Function;
}

export function Navbar({ hasBackButton, onBackClick }: NavbarProps): React.ReactElement {
    const [open, setOpen] = useState(true);
    const [isAccountPopover, setIsAccountPopover] = useState<boolean>(false);
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    useEffect(() => {
        if (!isSmallScreen) {
            setOpen(false);
        }
    }, [isSmallScreen]);

    const handleSidebarOpen = (): void => {
        setIsAccountPopover(false);
        setOpen(true);
    };

    const handlePopoverOpen = (): void => {
        setOpen(true);
        setIsAccountPopover(true);
    };

    const closeDrawer = (): void => {
        setOpen(false);
        setIsAccountPopover(false);
    };

    return (
        <>
            <Header
                hasBackButton={hasBackButton}
                onBackClick={onBackClick}
                isOpenSidebar={open}
                onOpenPopover={handlePopoverOpen}
                onOpenSidebar={handleSidebarOpen}
                onCloseSidebar={closeDrawer}
            />
            <Sidebar
                isOpenSidebar={open}
                onCloseSidebar={closeDrawer}
                onOpenSidebar={handleSidebarOpen}
                isAccountPopover={isAccountPopover}
                closeAccountPopover={closeDrawer}
            />
        </>
    );
}
