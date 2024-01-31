import React, { useContext, useEffect, useState } from 'react';
import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    styled,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import logoWithName from '../../assets/logoWithName.svg';
import yellowUnderlineIcon from '../../assets/yellowUnderlineIcon.svg';
import logo from '../../assets/logo.svg';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { AccountPopover } from './AccountPopover';
import {
    projectManagerNavigation,
    adminNavigation,
    projectManagerNavigationResponsive
} from './DrawerItems';
import { UserContext } from '../../provider/UserProvider';
import { Role } from '../../modules/profile/models/Role';
import { small1 } from '../../theme/typography';
import { NEUTRAL } from '../../theme/palette';
import { ArrowLeft } from 'react-feather';

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 70;

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    minHeight: APPBAR_MOBILE,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.up('lg')]: {
        minHeight: APPBAR_DESKTOP,
        padding: theme.spacing(0, 5)
    }
}));

interface HeaderProps {
    isOpenSidebar: boolean;
    onOpenSidebar: Function;
    onCloseSidebar: Function;
    onOpenPopover?: Function;
    hasBackButton?: boolean;
    onBackClick?: Function;
}

export function Header({
    isOpenSidebar,
    onOpenSidebar,
    onCloseSidebar,
    onOpenPopover = (): void => {},
    hasBackButton,
    onBackClick
}: HeaderProps): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const isLarge = useMediaQuery('(min-width:920px)');

    const { pathname } = useLocation();

    const [isLoaded, setLoaded] = useState(false);

    useEffect(() => {
        if (user) {
            setLoaded(true);
        }
    }, [user]);

    const RootStyle = styled(AppBar)(() => ({
        boxShadow: 'none',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
        backgroundColor: theme.palette.background.default,
        filter: 'drop-shadow(0px 4px 20px rgba(38, 38, 38, 0.1))'
    }));

    const highlightIcon = (): React.ReactElement => {
        return (
            <img src={yellowUnderlineIcon} alt="yellowUnderlineIcon" style={{ width: '20px' }} />
        );
    };

    const match = (path: string, innerPath?: string): boolean => {
        if (innerPath) {
            return !!matchPath(innerPath, pathname) || pathname.includes(innerPath);
        } else if (path) {
            return !!matchPath(path, pathname) || pathname.includes(path);
        } else {
            return false;
        }
    };

    const handleClick = (link: string): void => {
        navigate(`${link}`, { replace: true });
    };

    const Links = (linkTitle: string, path: string, innerPath?: string): React.ReactElement => {
        return (
            <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                onClick={(): void => handleClick(path)}>
                <Typography
                    m={1}
                    sx={{
                        ...small1,
                        color: match(path, innerPath) ? theme.palette.primary.main : NEUTRAL.medium,
                        cursor: 'pointer'
                    }}>
                    {t(linkTitle)}
                </Typography>
                {match(path, innerPath) ? highlightIcon() : null}
            </Box>
        );
    };

    const getNavigationItems = (): React.ReactElement[] => {
        if (user.user?.role.name === Role.admin) {
            const navigationItems = adminNavigation(t);
            return navigationItems.map((item, index) => (
                <span key={index} style={{ marginRight: '30px' }}>
                    {Links(item.title, item.path)}
                </span>
            ));
        } else if (user.user?.role.name === Role.projectManager) {
            if (isLarge) {
                const navigationItems = projectManagerNavigation(t);
                return navigationItems.map((item, index) => (
                    <span key={index} style={{ marginRight: '30px' }}>
                        {Links(item.title, item.path, item.innerPath)}
                    </span>
                ));
            } else {
                const navigationItems = projectManagerNavigationResponsive(t);
                return navigationItems.map((item, index) => (
                    <span key={index} style={{ marginRight: '30px' }}>
                        {Links(item.title, item.path, item.innerPath)}
                    </span>
                ));
            }
        } else {
            return [<></>];
        }
    };

    return (
        <>
            {isLoaded ? (
                <RootStyle sx={{ filter: isOpenSidebar ? 'none' : '' }}>
                    <ToolbarStyle>
                        {!isLarge && (
                            <>
                                {hasBackButton && onBackClick ? (
                                    <IconButton
                                        onClick={(): void => onBackClick()}
                                        sx={{ mr: 2, color: 'primary' }}>
                                        <ArrowLeft
                                            style={{ color: theme.palette.primary.medium }}
                                        />
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        onClick={(): void =>
                                            isOpenSidebar ? onCloseSidebar() : onOpenSidebar()
                                        }
                                        sx={{ mr: 2, color: 'text.primary' }}>
                                        {isOpenSidebar ? <CloseIcon /> : <MenuIcon />}
                                    </IconButton>
                                )}
                                <img src={logo} alt="logo" style={{ width: '50px' }} />
                                <AccountPopover openPopover={onOpenPopover} />
                            </>
                        )}
                        {isLarge && (
                            <>
                                <Box>
                                    <img
                                        src={logoWithName}
                                        alt="logoWithName"
                                        style={{ width: '150px' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex' }}>{getNavigationItems()}</Box>
                                <Box sx={{ width: '150px' }}>
                                    <AccountPopover />
                                </Box>
                            </>
                        )}
                    </ToolbarStyle>
                </RootStyle>
            ) : (
                <></>
            )}
        </>
    );
}
