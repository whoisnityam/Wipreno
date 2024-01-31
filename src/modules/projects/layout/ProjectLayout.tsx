import React, { useEffect, useState } from 'react';
import { Box, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '../../../components/sidebar/Sidebar';
import { projectsSidebarConfig } from '../../../components/sidebar/SidebarItems';
import { useTranslation } from 'react-i18next';
import { small1 } from '../../../theme/typography';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';

export interface ItemType {
    title: string;
    path: string;
    icon: JSX.Element;
}

export function ProjectLayout(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const sidebarConfig = projectsSidebarConfig(t);
    const isMounted = useIsMounted();
    const [searchParams] = useSearchParams();

    let currentTab: number;

    if (
        pathname.includes('/projects/current') ||
        pathname === '/projects/planning' ||
        pathname === '/projects'
    ) {
        currentTab = 0;
    } else if (pathname === '/projects/archived') {
        currentTab = 1;
    } else {
        currentTab = 2;
    }

    const [selectedItem, setSelectedItem] = useState<ItemType>(sidebarConfig[currentTab]);
    const [selectedTab, setSelectedTab] = useState(currentTab);

    const handleSelectedItem = (item: ItemType): void => {
        setSelectedItem(item);
        const params = searchParams.get('filter');
        if (params) {
            navigate({ pathname: item.path, search: `?filter=${searchParams.get('filter')}` });
        } else {
            navigate(item.path);
        }
    };

    const desktopView = (): React.ReactElement => {
        return (
            <>
                <Sidebar
                    title={t('projects')}
                    navConfig={sidebarConfig}
                    selectedItem={selectedItem}
                    handleSelectedItem={handleSelectedItem}
                />
                <Box height={'100%'} paddingLeft={'325px'}>
                    <Outlet />
                </Box>
            </>
        );
    };

    const tabs = (): React.ReactElement[] => {
        return [
            <Tab key={1} label={t('currentProjects')} />,
            <Tab key={2} label={t('archivedProjects')} />
        ];
    };

    useEffect(() => {
        if (isMounted) {
            handleSelectedItem(sidebarConfig[selectedTab]);
        }
    }, [selectedTab]);

    const mobileView = (): React.ReactElement => {
        return (
            <Box padding={'16px'} height={'100%'}>
                {pathname !== '/projects/planning' ? (
                    <>
                        <Typography variant={'h4'}>{t('projects')}</Typography>
                        <Box
                            sx={{
                                borderBottom: 1,
                                borderColor: NEUTRAL.light
                            }}>
                            <Tabs
                                sx={{
                                    '.MuiTab-root': {
                                        ...small1,
                                        padding: 0,
                                        marginRight: '40px',
                                        color: NEUTRAL.light
                                    },
                                    '.MuiTabs-indicator': {
                                        backgroundColor: ACCENT_SUNSET.medium
                                    }
                                }}
                                variant="scrollable"
                                value={selectedTab}
                                onChange={(_, newValue): void => setSelectedTab(newValue)}
                                aria-label="Project Tabs">
                                {tabs()}
                            </Tabs>
                        </Box>
                    </>
                ) : (
                    <></>
                )}

                <Outlet />
            </Box>
        );
    };

    return <Box height={'100%'}>{isLargeLandscape ? desktopView() : mobileView()}</Box>;
}
