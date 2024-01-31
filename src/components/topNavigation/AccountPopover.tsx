import {
    Avatar,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    styled,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NEUTRAL, ACCENT_SUNSET } from '../../theme/palette';
import { stringAvatar } from '../../utils';
import { body3 } from '../../theme/typography';
import { Alert } from '../alerts/Alert';
import { logout } from '../../modules/auth/services/AuthService';
import { UserContext } from '../../provider/UserProvider';

export const MenuItemStyle = styled(MenuItem)(({}) => ({
    padding: '4px 0',
    color: NEUTRAL.darker,
    justifyContent: 'left'
}));

interface AccountPopoverProps {
    openPopover?: Function;
}

export const AccountPopover = ({
    openPopover = (): void => {}
}: AccountPopoverProps): JSX.Element => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const user = useContext(UserContext);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (): void => {
        setAnchorEl(null);
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
            <Stack direction="row" alignItems="center" spacing={2} sx={{ paddingY: '20px' }}>
                {!isLarge && (
                    <>
                        <span onClick={(): void => openPopover()}>
                            <Avatar
                                sx={{
                                    background: ACCENT_SUNSET.lighter,
                                    color: ACCENT_SUNSET.darker
                                }}>
                                <Typography sx={{ ...body3, fontWeight: 700 }}>
                                    {stringAvatar(user.user?.first_name, user.user?.last_name)}
                                </Typography>
                            </Avatar>
                        </span>
                    </>
                )}
                {isLarge && (
                    <>
                        <Avatar
                            sx={{
                                background: ACCENT_SUNSET.lighter,
                                color: ACCENT_SUNSET.darker
                            }}>
                            <Typography sx={{ ...body3, fontWeight: 700 }}>
                                {stringAvatar(user.user?.first_name, user.user?.last_name)}
                            </Typography>
                        </Avatar>
                        <Divider
                            orientation={'vertical'}
                            flexItem
                            sx={{ borderWidth: `0.5px solid ${NEUTRAL.light}` }}
                        />
                        <IconButton onClick={handleMenuClick}>
                            <ChevronDown style={{ color: NEUTRAL.dark }} />
                        </IconButton>
                    </>
                )}
                <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{
                        style: {
                            margin: '40px 0',
                            padding: '36px 24px',
                            boxShadow:
                                '0px 10px 20px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04)'
                        },
                        sx: {
                            height: { lg: '130px' },
                            width: { lg: '260px' }
                        }
                    }}
                    sx={{ '.MuiList-root': { padding: 0 } }}>
                    <MenuItemStyle onClick={(): void => navigate('/profile')}>
                        <Typography variant="button" color={theme.palette.primary.main}>
                            {t('myAccount')}
                        </Typography>
                    </MenuItemStyle>
                    <MenuItemStyle onClick={(): void => setLogoutAlertOpen(true)}>
                        <Typography variant="button" color={theme.palette.primary.main}>
                            {t('logOut')}
                        </Typography>
                    </MenuItemStyle>
                </Menu>
            </Stack>
        </>
    );
};
