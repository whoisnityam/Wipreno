import React from 'react';
import { Box, Stack, styled, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import greenTick from '../../../assets/greenTick.svg';
import redCross from '../../../assets/redCross.svg';
import { body3 } from '../../../theme/typography';
import { SystemStyleObject } from '@mui/system';
import { NEUTRAL, ONBOARDING_PAYMENT_BUTTON } from '../../../theme/palette';

interface SubscriptionCardProps {
    title: string;
    subtitle: string;
    isSelected: boolean;
    isWhiteBackground: boolean;
    features: [{ feature: string; is_available: boolean }];
    onClick?: () => void;
}

const SubscriptionContainer = styled(Box)(() => ({
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '322px',
    justifyContent: 'space-evenly',
    width: '265px',
    minWidth: '250px',
    padding: '24px'
}));

export const SubscriptionCard = ({
    title,
    subtitle,
    isSelected,
    isWhiteBackground = false,
    features,
    onClick = (): void => {}
}: SubscriptionCardProps): React.ReactElement => {
    const { t } = useTranslation();

    const getFeatures = (): JSX.Element[] => {
        return features.map((item, index) => {
            return (
                <Stack direction={'row'} key={index} alignItems={'flex-start'}>
                    <img
                        src={item.is_available ? greenTick : redCross}
                        alt="available"
                        style={{ objectFit: 'contain', paddingRight: '2px', paddingTop: '5px' }}
                    />
                    <Typography sx={{ ...body3 }} color={NEUTRAL.medium}>
                        {item.feature}
                    </Typography>
                </Stack>
            );
        });
    };

    return (
        <SubscriptionContainer
            onClick={onClick}
            style={{ opacity: isSelected || isWhiteBackground ? '1.0' : '0.25' }}>
            <Typography variant="h6" color={'primary'} sx={{ textAlign: 'center' }}>
                {title}
            </Typography>
            <Typography
                variant="subtitle2"
                color={NEUTRAL.medium}
                sx={{ textAlign: 'center', paddingTop: '12px' }}>
                {subtitle}
            </Typography>
            <Stack flexGrow={1} pt={'22px'}>
                {getFeatures()}
            </Stack>
            <Box
                width={'100%'}
                display={'flex'}
                justifyContent={'center'}
                paddingY={'13.5px'}
                sx={(theme): SystemStyleObject<Theme> => ({
                    marginTop: '40px',
                    background:
                        isSelected && !isWhiteBackground
                            ? ONBOARDING_PAYMENT_BUTTON.selected
                            : theme.palette.secondary.lighter,
                    borderRadius: '4px'
                })}>
                <Typography
                    variant="button"
                    sx={(theme): SystemStyleObject<Theme> => ({
                        color:
                            isSelected || isWhiteBackground
                                ? theme.palette.success.dark
                                : theme.palette.primary.darker
                    })}>
                    {isSelected ? t('chosenOffer') : t('chooseThisOffer')}
                </Typography>
            </Box>
        </SubscriptionContainer>
    );
};
