import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminUsersSidebarConfig } from '../../../components/sidebar/SidebarItems';
import { ItemType } from '../../projects/layout/ProjectLayout';
import { Sidebar } from '../../../components/sidebar/Sidebar';

export const AdminUserLayout = (): React.ReactElement => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const sidebarConfig = AdminUsersSidebarConfig(t);
    const [selectItem, setSelectedItem] = useState<ItemType>(sidebarConfig[0]);

    useEffect(() => {
        if (pathname === '/users/clients' || pathname === '/users') {
            setSelectedItem(sidebarConfig[0]);
        } else {
            setSelectedItem(sidebarConfig[1]);
        }
    }, []);

    const handleSelectedItem = (item: ItemType): void => {
        setSelectedItem(item);
        navigate(item.path);
    };

    return (
        <Box height={'100%'}>
            <Sidebar
                title={t('users')}
                navConfig={sidebarConfig}
                selectedItem={selectItem}
                handleSelectedItem={handleSelectedItem}
            />
            <Box height={'100%'} paddingLeft={'325px'}>
                <Outlet />
            </Box>
        </Box>
    );
};
