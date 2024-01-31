import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NEUTRAL, PINK } from '../../../theme/palette';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';
import { getProfessionByUserId } from '../services/artisanService';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { User } from '../../profile/models/User';

interface ArtisanInformationProps {
    artisan: User;
}

export function ArtisanInformation({ artisan }: ArtisanInformationProps): React.ReactElement {
    const { t } = useTranslation();
    const [profession, setProfession] = useState<ArtisanProfession[]>([]);
    const isLarge = useMediaQuery('(min-width:920px)');

    const fetchProfessionDetails = async (): Promise<void> => {
        const data = await getProfessionByUserId(artisan.id);
        setProfession(data);
    };

    useEffect(() => {
        fetchProfessionDetails();
    }, []);

    const details = (): React.ReactElement => {
        return (
            <>
                <Typography variant={isLarge ? 'h5' : 'h6'} color={'primary'}>
                    {t('companyAndContact')}
                </Typography>
                <Stack direction={isLarge ? 'row' : 'column'}>
                    <Stack direction={'column'} width={isLarge ? '50%' : '100%'} mr={5}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                            {t('companyNameTableHeader')}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={NEUTRAL.medium}
                            sx={{
                                maxWidth: '310px',
                                maxHeight: '45px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {artisan.company_name}
                        </Typography>
                        {!isLarge && (
                            <>
                                <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                                    {t('contact')}
                                </Typography>
                                <Stack direction="row" alignItems="center" color={NEUTRAL.medium}>
                                    <Typography variant="body2">
                                        {`${artisan.first_name} ${artisan.last_name}`}
                                    </Typography>
                                </Stack>
                            </>
                        )}
                        {isLarge ? (
                            <>
                                <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                                    {t('emailField')}
                                </Typography>
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {artisan.email}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Stack
                                    direction={'row'}
                                    width={'100%'}
                                    justifyContent={'space-between'}>
                                    <Stack width={'60%'}>
                                        <Typography
                                            variant="subtitle2"
                                            color={NEUTRAL.darker}
                                            mt={3}
                                            sx={{ wordBreak: 'break-all' }}>
                                            {t('emailField')}
                                        </Typography>
                                        <Typography variant="body2" color={NEUTRAL.medium}>
                                            {artisan.email}
                                        </Typography>
                                    </Stack>
                                    <Stack width={'40%'}>
                                        <Typography
                                            variant="subtitle2"
                                            color={NEUTRAL.darker}
                                            mt={3}>
                                            {t('phoneNumber')}
                                        </Typography>
                                        <Typography variant="body2" color={NEUTRAL.medium}>
                                            {artisan.phone}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </>
                        )}
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                            {t('ProfessionTableHeader')}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-start',
                                width: isLarge ? '100%' : '325px',
                                flexDirection: isLarge ? '' : 'row'
                            }}>
                            {profession.map((item, index) => {
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            background: PINK.lighter,
                                            width: 'fit-content',
                                            marginRight: '8px',
                                            marginBottom: '8px'
                                        }}>
                                        <Typography
                                            key={index}
                                            sx={{
                                                ...small2,
                                                color: PINK.darker,
                                                padding: '4px 8px',
                                                fontWeight: fontWeightSemiBold,
                                                display: 'inline-block',
                                                whiteSpace: 'nowrap'
                                            }}>
                                            {item.profession}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Stack>
                    <Stack direction={'column'} width={'50%'}>
                        {isLarge && (
                            <>
                                <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                                    {t('contact')}
                                </Typography>
                                <Stack direction="row" alignItems="center" color={NEUTRAL.medium}>
                                    <Typography variant="body2">
                                        {`${artisan.first_name} ${artisan.last_name}`}
                                    </Typography>
                                </Stack>
                                <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                                    {t('phoneNumber')}
                                </Typography>
                                <Typography variant="body2" color={NEUTRAL.medium}>
                                    {artisan.phone}
                                </Typography>
                            </>
                        )}
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                            {t('Department')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {artisan?.artisan_id?.department}
                        </Typography>
                        <Typography variant="subtitle2" color={NEUTRAL.darker} mt={3}>
                            {t('address')}
                        </Typography>
                        <Typography variant="body2" color={NEUTRAL.medium}>
                            {artisan.address}
                        </Typography>
                    </Stack>
                </Stack>
            </>
        );
    };

    return <Box>{details()}</Box>;
}
