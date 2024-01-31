import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { useTranslation } from 'react-i18next';
import { WRTable } from '../../../components/WRTable';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { getInvoices } from '../services/SubscriptionService';
import { UserContext } from '../../../provider/UserProvider';
import { getSubscriptionPlans } from '../../onboarding/services/OnboardingService';
import { SubscriptionPlan } from '../../onboarding/models/SubscriptionPlan';
import { body3, small1, small2 } from '../../../theme/typography';
import { Box } from '@mui/system';
import { HighlightBox } from '../../clients/components/HighlightBox';
import { LoadingIndicator } from '../../../components/LoadingIndicator';

export function PaymentHistory(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const [invoices, setInvoices] = useState<
        { date: string; priceId: string; amount: number; invoicePdf: string }[]
    >([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const theme = useTheme();
    const [loading, setLoading] = useState<boolean>();

    const prepareData = useCallback(async () => {
        setLoading(true);
        const data = await getInvoices(user.user!.stripe_customer_id);
        const subscriptionPlans = await getSubscriptionPlans();
        setInvoices(data);
        setPlans(subscriptionPlans);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            prepareData();
        }
    }, []);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/profile/subscription', label: t('subscription') },
        { link: '#', label: t('paymentHistory') }
    ];

    const getPlan = (priceId: string): React.ReactElement => {
        const plan = plans.find((item) => item.price_id === priceId);
        if (plan?.is_pro) {
            return (
                <Chip
                    sx={{ backgroundColor: PINK.lighter, borderRadius: 0, ...small2 }}
                    label={t('teamSubscription')}
                />
            );
        } else {
            return (
                <Chip
                    sx={{
                        backgroundColor: theme.palette.secondary.lighter,
                        borderRadius: 0,
                        ...small2
                    }}
                    label={t('independentSubscription')}
                />
            );
        }
    };

    const tableHeaders = [t('dateOfPayment'), t('subscription'), t('amountWithTax')];

    const tableBody = invoices.map((invoice) => {
        return [
            new Date(invoice.date).toLocaleDateString(),
            getPlan(invoice.priceId),
            t('currency', { price: invoice.amount / 100 })
        ];
    });

    const responsiveTable = (): React.ReactElement[] => {
        if (invoices) {
            return invoices.map((invoice, index) => {
                return (
                    <Stack key={index} sx={{ marginTop: '24px' }}>
                        <Box
                            sx={{
                                border: `1px solid ${theme.palette.grey['100']}`,
                                borderRadius: '4px',
                                padding: '12px'
                            }}>
                            <Stack
                                width={'100%'}
                                direction={'row'}
                                justifyContent="space-between"
                                alignItems="center">
                                <Typography color={theme.palette.grey[200]} sx={{ ...body3 }}>
                                    {new Date(invoice.date).toLocaleDateString()}
                                </Typography>
                            </Stack>
                            <Typography color={NEUTRAL.darker} sx={{ ...small1 }}>
                                {t('currency', { price: invoice.amount / 100 })}
                            </Typography>
                            <Stack
                                width={'100%'}
                                direction={'row'}
                                sx={{ ...small2, marginTop: '15px' }}>
                                <HighlightBox
                                    text={getPlan(invoice.priceId).props.label}
                                    fontColour={PINK.darker}
                                    backgroundColour={PINK.lighter}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                );
            });
        } else {
            return [];
        }
    };

    const RenderComponent = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <Stack spacing={'37px'}>
                    {isLargeLandscape && <WRBreadcrumb links={breadcrumbData} />}
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                        <Typography variant={isLargeLandscape ? 'h4' : 'h5'} color={NEUTRAL.darker}>
                            {t('paymentHistory')}
                        </Typography>
                        {isLargeLandscape && (
                            <Button
                                variant={'outlined'}
                                onClick={(): void => {
                                    const invoice = invoices.at(0);
                                    if (invoice?.invoicePdf) {
                                        window.open(
                                            invoice.invoicePdf,
                                            '_blank',
                                            'noopener,noreferrer'
                                        );
                                    }
                                }}>
                                {t('seeInvoiceButtonTitle')}
                            </Button>
                        )}
                    </Stack>
                    {isLargeLandscape ? (
                        <WRTable headers={tableHeaders} body={tableBody} />
                    ) : (
                        responsiveTable()
                    )}
                    {!isLargeLandscape && (
                        <Button
                            variant={'outlined'}
                            onClick={(): void => {
                                const invoice = invoices.at(0);
                                if (invoice?.invoicePdf) {
                                    window.open(
                                        invoice.invoicePdf,
                                        '_blank',
                                        'noopener,noreferrer'
                                    );
                                }
                            }}>
                            {t('seeInvoiceButtonTitle')}
                        </Button>
                    )}
                </Stack>
            );
        }
    };
    return <>{RenderComponent()}</>;
}
