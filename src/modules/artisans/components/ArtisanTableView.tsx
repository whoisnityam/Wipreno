import React from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { body3, button2, fontWeightSemiBold, small1, small2 } from '../../../theme/typography';
import { useNavigate } from 'react-router-dom';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { User } from '../../profile/models/User';
import { WRTable } from '../../../components/WRTable';

interface ArtisanTableProps {
    artisans: User[];
    profession: ArtisanProfession[];
}

export const PinkBox = (item: string | number): React.ReactElement => {
    if (typeof item === 'string') {
        return (
            <Box
                sx={{
                    background: PINK.lighter,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: PINK.darker,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        whiteSpace: 'nowrap'
                    }}>
                    {item}
                </Typography>
            </Box>
        );
    } else {
        return (
            <Box
                sx={{
                    background: PINK.lighter,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: PINK.darker,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        whiteSpace: 'nowrap'
                    }}>
                    {`+`}
                    {item}
                </Typography>
            </Box>
        );
    }
};

export function ArtisanTable({ artisans, profession }: ArtisanTableProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const tableHeaders = [
        t('companyNameTableHeader'),
        t('lastAndFirstNameTableHeader'),
        t('emailFieldLabel'),
        t('phoneNumber'),
        t('ProfessionTableHeader'),
        ''
    ];

    const tableBody = artisans.map((artisan, index) => {
        const artisanProfession = profession.filter(
            (professions) => professions.user_id.id === artisan?.id
        );
        return [
            artisan?.company_name ?? '',
            `${artisan?.first_name} ${artisan?.last_name}`,
            artisan?.email,
            artisan?.phone,
            <Box key={index} display="flex">
                {artisanProfession.length >= 1 && PinkBox(artisanProfession[0].profession)}
                {artisanProfession.length >= 2 && <Box width="8px" />}
                {artisanProfession.length >= 2 && PinkBox(artisanProfession.length - 1)}
            </Box>,
            <Button
                key={index}
                variant={'outlined'}
                color={'secondary'}
                fullWidth
                onClick={(): void => navigate(`/artisan/details/${artisan.id}`)}
                sx={{ borderRadius: '4px', width: '147px' }}>
                {t('seeNoticeButtonTitle')}
            </Button>
        ];
    });

    const responsiveTable = (): React.ReactElement[] => {
        return artisans.map((artisan, index) => {
            const artisanProfession = profession.filter(
                (professions) => professions.user_id.id === artisan?.id
            );
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
                            <Typography
                                color={NEUTRAL.darker}
                                sx={{
                                    ...small1,
                                    wordBreak: 'break-all',
                                    maxWidth: '70%',
                                    maxHeight: '45px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                {artisan?.company_name ?? ''}
                            </Typography>
                            <Typography
                                color={theme.palette.secondary.main}
                                sx={{
                                    ...button2,
                                    fontWeight: 'bold',
                                    margin: '0% 3%',
                                    marginTop: '18px',
                                    textTransform: 'none',
                                    maxWidth: '20%'
                                }}
                                onClick={(): void => navigate(`/artisan/details/${artisan.id}`)}>
                                {t('seeMore')}
                            </Typography>
                        </Stack>
                        <Stack width={'100%'} direction={'row'} sx={{ ...small2 }}>
                            {artisanProfession.length >= 1 &&
                                PinkBox(artisanProfession[0].profession)}
                            {artisanProfession.length >= 2 && <Box width="8px" />}
                            {artisanProfession.length >= 2 && PinkBox(artisanProfession.length - 1)}
                        </Stack>
                        <Stack width={'100%'} direction={'row'} sx={{ marginTop: '16px' }}>
                            <Typography color={theme.palette.grey[200]} sx={{ ...small2 }}>
                                {t('contact') + ' : '}
                            </Typography>
                            <Typography color={theme.palette.grey[200]} sx={{ ...body3 }}>
                                {`${artisan?.first_name} ${artisan?.last_name}`}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            );
        });
    };

    return (
        <>
            {isLargeLandscape ? (
                <WRTable headers={tableHeaders} body={tableBody} />
            ) : (
                responsiveTable()
            )}
        </>
    );
}
