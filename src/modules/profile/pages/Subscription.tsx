import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    Slide,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../theme/palette';
import { UserContext } from '../../../provider/UserProvider';
import { getUserCount } from '../services/SubscriptionService';
import { useNavigate } from 'react-router-dom';
import { ModalContainer } from '../../../components/ModalContainer';
import { SaveModifyAddressForm } from './SaveModifyAddressForm';
import { GetCurrentUser } from '../../../services/DirectusService';
import { SubscriptionAnnual, SubscriptionMonthly } from '../../../constants';
import { button2 } from '../../../theme/typography';
import { postalCheck } from '../../../utils';

export function Subscription(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useContext(UserContext);
    const [updatedUser, setUpdatedUser] = useState(user.user);
    const [count, setCount] = useState(0);
    const [openModifyForm, setOpenModifyForm] = useState<boolean>(false);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const theme = useTheme();
    const [openModifyFormResponsive, setOpenModifyFormResponsive] = useState<boolean>(false);

    const handleClose = (): void => {
        setOpenModifyFormResponsive(false);
    };
    const prepareData = useCallback(async () => {
        const userCount = await getUserCount(user.user!.enterprises.at(0)!.enterprise_id.id);
        setCount(userCount);
    }, []);

    useEffect(() => {
        if (user) {
            prepareData();
        }
    }, []);

    const userDatas = async (): Promise<void> => {
        const res = await GetCurrentUser();
        setUpdatedUser(res);
    };
    useEffect(() => {
        userDatas();
    }, []);

    const openSuccessModal = (): void => {
        if (isLargeLandscape) {
            setOpenModifyForm(false);
        } else {
            setOpenModifyFormResponsive(false);
        }
        userDatas();
    };

    const renderModifyForm = (): React.ReactElement => {
        return (
            <SaveModifyAddressForm
                handleCloseForm={(): void => {
                    if (isLargeLandscape) {
                        setOpenModifyForm(false);
                    } else {
                        setOpenModifyFormResponsive(false);
                    }
                }}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const getSubscriptionDetails = (): React.ReactElement => {
        if (user.user?.subscription_plan_id.is_trial) {
            return (
                <>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('freeSubscriptionDescriptionHeader')}
                        </Typography>
                    </Stack>
                </>
            );
        } else if (user.user?.subscription_plan_id.is_pro) {
            return (
                <>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('teamSubscriptionDescriptionHeader', {
                                price:
                                    user.user.subscription_plan_id.type === 'MONTHLY'
                                        ? SubscriptionMonthly.pro
                                        : SubscriptionAnnual.pro
                            })}
                        </Typography>
                    </Stack>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('noOfUsers', { users: count - 1, price: (count - 1) * 15 })}
                        </Typography>
                    </Stack>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('totalPriceHeader', {
                                price:
                                    user.user.subscription_plan_id.type === 'MONTHLY'
                                        ? SubscriptionMonthly.pro + (count - 1) * 15
                                        : SubscriptionAnnual.pro + (count - 1) * 15
                            })}
                        </Typography>
                    </Stack>
                </>
            );
        } else {
            return (
                <>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('independentSubscriptionDescriptionHeader', {
                                price:
                                    user.user?.subscription_plan_id.type === 'MONTHLY'
                                        ? SubscriptionMonthly.independent
                                        : SubscriptionAnnual.independent
                            })}
                        </Typography>
                    </Stack>
                    <Stack direction={'row'}>
                        {t('noOfUsers', { users: count - 1, price: (count - 1) * 15 })}
                    </Stack>
                    <Stack direction={'row'}>
                        <Typography component={'span'}>
                            {t('totalPriceHeader', {
                                price:
                                    user.user?.subscription_plan_id.type === 'MONTHLY'
                                        ? SubscriptionMonthly.independent + (count - 1) * 15
                                        : SubscriptionAnnual.independent + (count - 1) * 15
                            })}
                        </Typography>
                    </Stack>
                </>
            );
        }
    };

    const getCompanyName = (): string => {
        if (updatedUser && updatedUser.company_name !== null) {
            return updatedUser.company_name;
        } else {
            return '';
        }
    };

    return (
        <Stack sx={{ padding: '12px' }}>
            {isLargeLandscape && (
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant={'h3'} color={NEUTRAL.darker}>
                        {t('subscription')}
                    </Typography>
                    <Button
                        variant={'outlined'}
                        onClick={(): void => navigate('/profile/payment-history')}>
                        {t('viewPaymentHistory')}
                    </Button>
                </Stack>
            )}
            <Stack
                mt={'32px'}
                p={'32px'}
                direction={'row'}
                sx={{ backgroundColor: NEUTRAL.white }}
                justifyContent={'space-between'}>
                <Stack justifyContent={'space-between'}>
                    <Typography
                        variant={isLargeLandscape ? 'h5' : 'h6'}
                        color={theme.palette.primary.main}>
                        {t('actualSubscription')}
                    </Typography>
                    <Typography component={'span'} variant={isLargeLandscape ? 'body1' : 'body2'}>
                        {getSubscriptionDetails()}
                    </Typography>
                </Stack>
                {isLargeLandscape && (
                    <Button
                        variant={'contained'}
                        color={'secondary'}
                        onClick={(): void => navigate('/profile/change-subscription')}>
                        {t('changeSubscription')}
                    </Button>
                )}
            </Stack>
            <Stack direction={'row'} mt={'49px'}>
                <Stack spacing={'25px'} width={isLargeLandscape ? '40%' : '100%'}>
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                        <Typography variant={isLargeLandscape ? 'h5' : 'h6'}>
                            {t('billingAddress')}
                        </Typography>
                        {isLargeLandscape ? (
                            <>
                                <Button
                                    color={'secondary'}
                                    onClick={(): void => setOpenModifyForm(true)}>
                                    {t('modifyButtonTitle')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    color={'secondary'}
                                    sx={{ ...button2 }}
                                    onClick={(): void => {
                                        setOpenModifyFormResponsive(true);
                                    }}>
                                    {t('modifyButtonTitle')}
                                </Button>
                            </>
                        )}
                    </Stack>
                    <Stack spacing={'12px'}>
                        <TextField
                            required
                            disabled
                            id="companyName"
                            name="companyName"
                            label={t('companyName')}
                            value={getCompanyName()}
                        />
                        <TextField
                            required
                            disabled
                            id="address"
                            name="address"
                            label={t('address')}
                            value={updatedUser ? updatedUser?.address : ''}
                        />
                        <Stack direction={'row'} spacing={'12px'} justifyContent={'space-between'}>
                            <TextField
                                required
                                disabled
                                sx={{ width: '49%' }}
                                id="postalCode"
                                name="postalCode"
                                label={t('postalCode')}
                                value={
                                    updatedUser ? postalCheck(updatedUser?.postal_code ?? '') : ''
                                }
                            />
                            <TextField
                                required
                                disabled
                                sx={{ width: '49%' }}
                                id="city"
                                name="city"
                                label={t('city')}
                                value={updatedUser ? updatedUser?.city : ''}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            {!isLargeLandscape && (
                <Stack mt={'80px'} spacing={'16px'}>
                    <>
                        <Button
                            variant={'outlined'}
                            onClick={(): void => navigate('/profile/payment-history')}>
                            {t('viewPaymentHistory')}
                        </Button>
                        <Button
                            variant={'contained'}
                            color={'secondary'}
                            onClick={(): void => navigate('/profile/change-subscription')}>
                            {t('changeSubscription')}
                        </Button>
                    </>
                </Stack>
            )}
            {!isLargeLandscape && (
                <>
                    <Slide direction="up" in={openModifyFormResponsive}>
                        <Dialog
                            open={openModifyFormResponsive}
                            keepMounted
                            onClose={handleClose}
                            aria-describedby="alert-dialog-history-of-project"
                            sx={{
                                '.MuiDialog-paper': {
                                    minHeight: 'calc(100% - 40px)',
                                    maxHeight: 'calc(100% - 40px)',
                                    minWidth: '100%',
                                    maxWidth: '100%',
                                    margin: 'unset',
                                    marginTop: '40px',
                                    padding: '25px',
                                    overflowY: 'scroll',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }
                            }}>
                            <>{renderModifyForm()}</>
                        </Dialog>
                    </Slide>
                </>
            )}
            <ModalContainer
                isModalOpen={openModifyForm}
                content={renderModifyForm()}
                onClose={(): void => setOpenModifyForm(false)}
            />
        </Stack>
    );
}
