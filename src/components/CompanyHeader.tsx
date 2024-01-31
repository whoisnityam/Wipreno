import { Box, Container, Stack, SxProps, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../modules/profile/models/User';
import { NEUTRAL } from '../theme/palette';
import { getFileURL, postalCheck } from '../utils';

interface CompanyHeaderProps {
    companyLogo: string;
    logoSize?: string;
    bgColor?: string;
    sxProps?: SxProps;
    userInfo: User | null;
    clientInfo: User | null | undefined;
    projectAddress: { address?: string; postal_code?: string; city?: string };
    customFontStyle?: SxProps;
    outerBoxStyle?: SxProps;
}

export function CompanyHeader({
    companyLogo,
    logoSize = '50px',
    bgColor = '#D9F5C4',
    sxProps,
    userInfo,
    clientInfo,
    projectAddress,
    customFontStyle,
    outerBoxStyle
}: CompanyHeaderProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const useStyles = makeStyles(() => ({
        boxStyle: {
            ...sxProps
        },
        fontStyle: {
            ...customFontStyle
        },
        outerBoxStyle: {
            ...outerBoxStyle
        }
    }));
    const classes = useStyles();

    return (
        <Box
            className={classes.outerBoxStyle}
            sx={{
                width: '100%',
                backgroundColor: bgColor,
                paddingTop: '8px',
                paddingLeft: '20px',
                paddingRight: '20px'
            }}>
            <Container sx={{ backgroundColor: NEUTRAL.white }} className={classes.boxStyle}>
                <Stack direction={'row'}>
                    <Box mt={'55px'} mb={'4px'} mr={4}>
                        {companyLogo && companyLogo !== '' ? (
                            <>
                                <Box
                                    sx={{
                                        border: '1px solid',
                                        borderColor: theme.palette.grey[100],
                                        width: logoSize,
                                        height: logoSize
                                    }}>
                                    {companyLogo && companyLogo !== '' ? (
                                        <img
                                            src={getFileURL(companyLogo)}
                                            alt="company logo"
                                            height={logoSize}
                                            width={logoSize}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : null}
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={{ marginLeft: '180px' }} />
                            </>
                        )}
                    </Box>
                    <Stack direction={'column'} mt={'55px'} width={'50%'}>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {`${userInfo?.first_name} ${userInfo?.last_name} `}
                        </Typography>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {userInfo?.address}
                        </Typography>
                        <Stack flexDirection={'row'}>
                            <Typography
                                className={classes.fontStyle}
                                sx={{ fontSize: '6px', marginRight: '4px', color: NEUTRAL.darker }}>
                                {postalCheck(userInfo?.postal_code ?? '')}
                            </Typography>
                            <Typography
                                className={classes.fontStyle}
                                sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                                {userInfo?.city}
                            </Typography>
                        </Stack>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {t('France')}
                        </Typography>
                        <Typography
                            className={classes.fontStyle}
                            mt={1}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {t('phoneLabel')}
                            {userInfo?.phone}
                        </Typography>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {userInfo?.email}
                        </Typography>
                    </Stack>
                    <Stack
                        direction={'column'}
                        width={'50%'}
                        mb={'4px'}
                        borderRadius={'8px'}
                        padding={'8px'}
                        sx={{
                            backgroundColor: NEUTRAL.lighter,
                            marginTop: '55px',
                            borderRadius: '4px'
                        }}>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {t('clientName')}
                        </Typography>
                        <Typography
                            className={classes.fontStyle}
                            sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                            {`${clientInfo?.first_name ?? ''} ${clientInfo?.last_name ?? ''}`}
                        </Typography>
                        {projectAddress?.address ? (
                            <>
                                <Typography
                                    className={classes.fontStyle}
                                    sx={{
                                        fontSize: '6px',
                                        color: NEUTRAL.darker,
                                        marginTop: '5px'
                                    }}>
                                    {projectAddress?.address}
                                </Typography>
                                <Stack flexDirection={'row'}>
                                    <Typography
                                        className={classes.fontStyle}
                                        sx={{
                                            fontSize: '6px',
                                            marginRight: '4px',
                                            color: NEUTRAL.darker
                                        }}>
                                        {postalCheck(projectAddress?.postal_code ?? '')}
                                    </Typography>
                                    <Typography
                                        className={classes.fontStyle}
                                        sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                                        {projectAddress?.city}
                                    </Typography>
                                </Stack>
                                <Typography
                                    className={classes.fontStyle}
                                    sx={{ fontSize: '6px', color: NEUTRAL.darker }}>
                                    {t('France')}
                                </Typography>
                            </>
                        ) : (
                            <></>
                        )}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
