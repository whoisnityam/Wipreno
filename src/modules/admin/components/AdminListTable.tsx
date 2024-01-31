import { Box, Button, Popover, Stack, Theme, Typography, useTheme } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WRTable } from '../../../components/WRTable';
import { User } from '../../profile/models/User';
import { MoreHorizontal } from 'react-feather';
import { makeStyles } from '@mui/styles';
import { NEUTRAL } from '../../../theme/palette';
import { ModalContainer } from '../../../components/ModalContainer';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { SystemStyleObject } from '@mui/system';
import { button2 } from '../../../theme/typography';
import { CreateAdminUser } from './CreateAdminUser';
import { deleteAdmin } from '../services/AdminManagementService';
import { UserContext } from '../../../provider/UserProvider';
import { logout } from '../../auth/services/AuthService';
import { useNavigate } from 'react-router-dom';

interface AdminListTableProps {
    adminList: User[];
    prepareData: Function;
}

export const AdminListTable = ({
    adminList,
    prepareData
}: AdminListTableProps): React.ReactElement => {
    const useStyles = makeStyles(() => ({
        popoverStyle: {
            '& .MuiPopover-paper': {
                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                width: '200px'
            }
        }
    }));

    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useContext(UserContext);
    const theme = useTheme();
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<SVGElement | null>(null);
    const [isModify, setIsModify] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [currentAdmin, setCurrentAdmin] = useState<User>();
    const [openDeleteSuccess, setOpenDeleteSuccess] = useState<boolean>(false);
    const [openCreateAdmin, setOpenCreateAdmin] = useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<SVGElement, MouseEvent>): void => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const openSuccessModal = (): void => {
        setOpenDeleteSuccess(true);
        setOpenCreateAdmin(false);
        setOpenDelete(false);
        setTimeout(async () => {
            prepareData();
            setOpenDeleteSuccess(false);
            if (user.user?.id === currentAdmin?.id && !isModify) {
                logout();
                navigate('/auth/login', { replace: true });
            }
        }, 3000);
    };

    const headers = [
        t('lastName'),
        t('firstNameTextFieldLabel'),
        t('emailField'),
        t('addDate'),
        ''
    ];
    const body = adminList.map((data) => {
        return [
            <Typography key="title" variant="body2">
                {data.last_name}
            </Typography>,
            <Typography key="title" variant="body2">
                {data.first_name}
            </Typography>,
            <Typography key="title" variant="body2">
                {data.email}
            </Typography>,
            <Typography key="title" variant="body2">
                {data.phone}
            </Typography>,
            <div key={data.id}>
                <Box>
                    <MoreHorizontal
                        key={data.id}
                        onClick={(e): void => {
                            handleClick(e);
                            setCurrentAdmin(data);
                        }}
                    />
                </Box>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -200
                    }}
                    className={classes.popoverStyle}>
                    <Typography
                        sx={{ p: 1 }}
                        color={NEUTRAL.medium}
                        variant="body1"
                        onClick={(): void => {
                            setOpenCreateAdmin(true);
                            setIsModify(true);
                            setAnchorEl(null);
                        }}>
                        {t('modifyButtonTitle')}
                    </Typography>
                    <Typography
                        sx={{ p: 1 }}
                        color={theme.palette.error.main}
                        variant="body1"
                        onClick={(): void => {
                            setOpenDelete(true);
                            setAnchorEl(null);
                        }}>
                        {t('remove')}
                    </Typography>
                </Popover>
            </div>
        ];
    });

    const deleteUser = (): React.ReactElement => {
        return (
            <Box>
                <Typography variant="h4" color={NEUTRAL.darker} sx={{ textAlign: 'center' }}>
                    {t('wantToDeleteAdmin')}
                </Typography>
                <Typography
                    variant="body1"
                    color={NEUTRAL.medium}
                    sx={{ textAlign: 'center', marginTop: '48px' }}>
                    {t('deleteAdminDisclaimer')}
                </Typography>
                <Stack direction="row" sx={{ marginTop: '80px' }}>
                    <Button
                        fullWidth
                        type="button"
                        size="medium"
                        sx={{
                            border: '1px solid',
                            borderColor: theme.palette.secondary.main,
                            borderRadius: '4px',
                            marginRight: '20px'
                        }}
                        onClick={(): void => {
                            setOpenDelete(false);
                        }}>
                        <Typography
                            color={theme.palette.secondary.main}
                            sx={(): SystemStyleObject<Theme> => ({
                                ...button2,
                                fontWeight: 'bold',
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}>
                            {t('cancelButtonTitle')}
                        </Typography>
                    </Button>
                    <Button
                        fullWidth
                        type="button"
                        size="medium"
                        variant="contained"
                        color="error"
                        onClick={async (): Promise<void> => {
                            if (currentAdmin) {
                                await deleteAdmin(currentAdmin?.id);
                                openSuccessModal();
                            }
                        }}>
                        <Typography
                            color={NEUTRAL.white}
                            sx={(): SystemStyleObject<Theme> => ({
                                ...button2,
                                fontWeight: 'bold',
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}>
                            {t('remove')}
                        </Typography>
                    </Button>
                </Stack>
            </Box>
        );
    };

    return (
        <>
            <WRTable headers={headers} body={body} />
            <CreateAdminUser
                openForm={openCreateAdmin}
                handleClose={(): void => {
                    setCurrentAdmin(undefined);
                    setOpenCreateAdmin(false);
                }}
                isModify={isModify}
                selectedAdmin={currentAdmin}
                initialValues={{
                    email: currentAdmin?.email ?? '',
                    first_name: currentAdmin?.first_name ?? '',
                    last_name: currentAdmin?.last_name ?? ''
                }}
                handleSuccess={(): void => openSuccessModal()}
            />
            <ModalContainer
                isModalOpen={openDelete}
                onClose={(): void => setOpenDelete(false)}
                content={deleteUser()}
            />
            <SuccessAlert
                title={t('requestHasBeenTaken')}
                subtitle={t('youWillRedirectToAdminManagement')}
                open={openDeleteSuccess}
            />
        </>
    );
};
