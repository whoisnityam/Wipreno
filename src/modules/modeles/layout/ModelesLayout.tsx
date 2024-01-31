import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/sidebar/Sidebar';
import { ModelsSidebarConfig } from '../../../components/sidebar/SidebarItems';
import { useTranslation } from 'react-i18next';
import { ItemType } from '../../projects/layout/ProjectLayout';

export function ModelesLayout(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const sidebarConfig = ModelsSidebarConfig(t);
    const [selectItem, setSelectedItem] = useState<ItemType>(sidebarConfig[0]);

    useEffect(() => {
        if (pathname === '/modeles/predefined' || pathname === '/modeles') {
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
                title={t('modelsSidebarTitle')}
                navConfig={sidebarConfig}
                selectedItem={selectItem}
                handleSelectedItem={handleSelectedItem}
            />
            <Box height={'100%'} paddingLeft={'325px'}>
                <Outlet />
            </Box>
        </Box>
    );
}
