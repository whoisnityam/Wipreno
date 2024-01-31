import React, { useState } from 'react';
import { NavLink as RouterLink, useNavigate } from 'react-router-dom';
import { Box, List, ListItemText, ListItemButton, useTheme } from '@mui/material';
import { logout } from '../../modules/auth/services/AuthService';
import { Alert } from '../alerts/Alert';
import { useTranslation } from 'react-i18next';

interface NavItemProps {
    item: { title: string; path: string };
}

function NavItem({ item }: NavItemProps): JSX.Element {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { title, path } = item;
    const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

    const linkStyle = {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        '&:before': { display: 'block' }
    };

    return (
        <>
            <Alert
                title={t('logoutAlertTitle')}
                primaryButton={t('logoutButtonTitle')}
                secondaryButton={t('cancelButtonTitle')}
                open={logoutAlertOpen}
                onClick={(): void => {
                    logout();
                    navigate('/auth/login');
                }}
                onClose={(): void => setLogoutAlertOpen(false)}
            />
            {path === '/logout' ? (
                <ListItemButton
                    onClick={(): void => setLogoutAlertOpen(true)}
                    sx={{
                        ...linkStyle
                    }}>
                    <ListItemText disableTypography primary={title} />
                </ListItemButton>
            ) : (
                <ListItemButton
                    component={RouterLink}
                    to={path}
                    sx={{
                        ...linkStyle
                    }}>
                    <ListItemText disableTypography primary={title} />
                </ListItemButton>
            )}
        </>
    );
}

interface NavSectionProps {
    navConfig: { title: string; path: string }[];
}

export function NavSection({ navConfig }: NavSectionProps): JSX.Element {
    return (
        <Box sx={{ paddingTop: '88px' }}>
            <List disablePadding>
                {navConfig.map((item) => (
                    <NavItem key={item.title} item={item} />
                ))}
            </List>
        </Box>
    );
}
