import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArtisanInformation } from '../components/ArtisanInformation';
import {
    deleteProfessionByIds,
    getArtisanById,
    getProfessionByUserId,
    removeArtisanUser
} from '../services/artisanService';
import { NEUTRAL } from '../../../theme/palette';
import { Upload } from 'react-feather';
import { User } from '../../profile/models/User';
import { getFileURL } from '../../../utils';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { UserContext } from '../../../provider/UserProvider';
import { ModalContainer } from '../../../components/ModalContainer';
import { SaveArtisanForms } from './SaveArtisanForms';
import { ArtisanContext } from '../layout/ArtisanDetailLayout';
import { ArtisanProfession } from '../models/ArtisanProfession';

export function ArtisanDetails(): React.ReactElement {
    const { id } = useParams();
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const user = useContext(UserContext).user;
    const artisanContext = useContext(ArtisanContext);
    const isLarge = useMediaQuery('(min-width:920px)');
    const [artisanId, setArtisanId] = useState<string>('');
    const [artisan, setArtisan] = useState<User>();
    const [DecennialInsuranceErr, setDecennialInsuranceErr] = useState<string>('');
    const [ribErr, setRibErr] = useState<string>('');
    const [openArtisanForm, setOpenArtisanForm] = useState<boolean>(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState<boolean>(false);
    const [profession, setProfession] = useState<ArtisanProfession[]>([]);

    useEffect(() => {
        if (id) {
            setArtisanId(id);
        }
    }, [id]);

    const openSuccessModal = (): void => {
        artisanContext?.refreshData();
    };

    const fetchArtisanDetails = async (): Promise<void> => {
        const data = await getArtisanById(artisanId);
        setArtisan(data);
        const professionData = await getProfessionByUserId(data.id);
        setProfession(professionData);
    };

    useEffect(() => {
        if (artisanId !== '') {
            fetchArtisanDetails();
        }
    }, [artisanId]);

    const openDeleteSuccessModal = (): void => {
        setOpenDeleteAlert(false);
        setDeleteSuccessModalOpen(true);
        setTimeout(async () => {
            setDeleteSuccessModalOpen(false);
            navigate('/artisans/list', { replace: true });
        }, 3000);
    };

    const handleDelete = async (): Promise<void> => {
        if (id) {
            if (artisan) {
                await deleteProfessionByIds(artisan.artisan_profession.map((item) => item.id));
                await removeArtisanUser(artisan.id, user!.enterprises!.at(0)!.enterprise_id.id);
                openDeleteSuccessModal();
            }
        }
    };

    const handelDecennialErr = (): void => {
        setDecennialInsuranceErr(t('noFilePresent'));
        setTimeout(async () => {
            setDecennialInsuranceErr('');
        }, 3000);
    };
    const handelRibErr = (): void => {
        setRibErr(t('noFilePresent'));
        setTimeout(async () => {
            setRibErr('');
        }, 3000);
    };

    const getDecennialDownloadFile = (): React.ReactElement => {
        if (artisan?.artisan_id.decennial_insurance) {
            return (
                <>
                    <a
                        href={getFileURL(artisan.artisan_id.decennial_insurance.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        download="assurance decennale.pdf">
                        <Button
                            fullWidth
                            style={{
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    display: 'flex',
                                    width: '80%',
                                    color: theme.palette.grey[200],
                                    fontWeight: 400,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                {artisan.artisan_id.decennial_insurance.title}
                            </Typography>
                            <Upload
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '10px',
                                    color: theme.palette.grey[200]
                                }}
                            />
                        </Button>
                    </a>
                </>
            );
        } else {
            return (
                <>
                    <Button
                        fullWidth
                        onClick={handelDecennialErr}
                        style={{
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                        <Typography
                            variant="body2"
                            sx={{
                                display: 'flex',
                                width: '80%',
                                color: theme.palette.grey[100],
                                fontWeight: 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {t('decennialInsurance')}
                        </Typography>
                        <Upload
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                color: theme.palette.grey[100]
                            }}
                        />
                    </Button>
                </>
            );
        }
    };

    const getRibDownloadFile = (): React.ReactElement => {
        if (artisan?.artisan_id.rib) {
            return (
                <>
                    <a
                        href={getFileURL(artisan.artisan_id.rib.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        download="Rib.pdf">
                        <Button
                            fullWidth
                            style={{
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    display: 'flex',
                                    width: '80%',
                                    color: theme.palette.grey[200],
                                    fontWeight: 400,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                {artisan.artisan_id.rib.title}
                            </Typography>
                            <Upload
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '10px',
                                    color: theme.palette.grey[200]
                                }}
                            />
                        </Button>
                    </a>
                </>
            );
        } else {
            return (
                <>
                    <Button
                        fullWidth
                        onClick={handelRibErr}
                        style={{
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                        <Typography
                            variant="body2"
                            sx={{
                                display: 'flex',
                                width: '80%',
                                color: theme.palette.grey[100],
                                fontWeight: 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {t('rib')}
                        </Typography>
                        <Upload
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                color: theme.palette.grey[100]
                            }}
                        />
                    </Button>
                </>
            );
        }
    };
    const ArtisanDocument = (): React.ReactElement => {
        return (
            <Box>
                <Typography
                    variant={isLarge ? 'h5' : 'h6'}
                    color={'primary'}
                    sx={{ marginTop: isLarge ? '' : '40px' }}>
                    {t('documents')}
                </Typography>
                <Stack
                    mt={3}
                    direction={isLarge ? 'row' : 'column'}
                    justifyContent={'space-between'}>
                    <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                        <Typography variant="subtitle2" color={NEUTRAL.darker}>
                            {t('decennialInsurance')}
                        </Typography>
                        <Box
                            sx={{
                                marginTop: '16px',
                                border: '1px solid',
                                borderColor: theme.palette.grey[100],
                                width: '100%',
                                maxWidth: '320px',
                                borderRadius: '4px',
                                minWidth: '150px',
                                textDecoration: 'none'
                            }}>
                            {getDecennialDownloadFile()}
                        </Box>
                        {DecennialInsuranceErr !== '' ? (
                            <>
                                <Typography
                                    mt={1}
                                    sx={{
                                        color: theme.palette.error.main,
                                        fontSize: '12px',
                                        fontFamily: 'Poppins'
                                    }}>
                                    {DecennialInsuranceErr}
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                    <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                        <Typography
                            variant="subtitle2"
                            color={NEUTRAL.darker}
                            sx={{ marginTop: isLarge ? '' : '16px' }}>
                            {t('rib')}
                        </Typography>
                        <Box
                            sx={{
                                marginTop: '16px',
                                border: '1px solid',
                                borderColor: theme.palette.grey[100],
                                width: '100%',
                                maxWidth: '320px',
                                borderRadius: '4px',
                                minWidth: '150px',
                                textDecoration: 'none'
                            }}>
                            {getRibDownloadFile()}
                        </Box>
                        {ribErr !== '' ? (
                            <>
                                <Typography
                                    mt={1}
                                    sx={{
                                        color: theme.palette.error.main,
                                        fontSize: '12px',
                                        fontFamily: 'Poppins'
                                    }}>
                                    {ribErr}
                                </Typography>
                            </>
                        ) : null}
                    </Box>
                </Stack>
                <Box sx={{ marginTop: isLarge ? '24px' : '40px' }}>
                    <Typography variant={isLarge ? 'h5' : 'h6'}>{t('remark')}</Typography>
                    <Typography
                        mt={2}
                        variant="body2"
                        sx={{ wordBreak: 'break-word' }}
                        color={NEUTRAL.medium}>
                        {artisan?.artisan_id?.remark}
                    </Typography>
                </Box>
                {!isLarge && (
                    <Stack mt={5} width={'100%'} display={'flex'}>
                        <Button
                            fullWidth
                            type="button"
                            size="medium"
                            variant={'outlined'}
                            color={'secondary'}
                            onClick={(): void => setOpenArtisanForm(true)}>
                            {t('modifyButtonTitle')}
                        </Button>
                        <Box height={'10px'} />
                        <Button
                            fullWidth
                            type="button"
                            size="medium"
                            variant={'outlined'}
                            onClick={(): void => setOpenDeleteAlert(true)}
                            sx={{
                                color: theme.palette.error.main,
                                borderColor: theme.palette.error.main,
                                ':hover': {
                                    borderColor: theme.palette.error.main
                                },
                                marginBottom: '24px'
                            }}>
                            {t('deleteButtonTitle')}
                        </Button>
                    </Stack>
                )}
            </Box>
        );
    };

    const renderArtisanForm = (): React.ReactElement => {
        return (
            <SaveArtisanForms
                handleCloseForm={(): void => setOpenArtisanForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
                artisan={artisan}
                profession={profession}
            />
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                display: isLarge ? 'flex' : '',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
            <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                {artisan ? <ArtisanInformation artisan={artisan} /> : ''}
            </Box>
            <Box sx={{ width: isLarge ? '47%' : '100%' }}>
                <ArtisanDocument />
            </Box>
            <Alert
                width="440px"
                title={t('wantToDeleteArtisan')}
                subtitle={t('artisanDeleteDisclaimer')}
                open={openDeleteAlert}
                onClick={(): Promise<void> => handleDelete()}
                onSecondaryButtonClick={(): void => {
                    setOpenDeleteAlert(false);
                }}
                primaryButton={t('remove')}
                primaryButtonType="error"
                secondaryButton={t('toCancel')}
                secondaryButtonType={'text'}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={deleteSuccessModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillRedirectToArtisans')}
            />
            <ModalContainer
                isModalOpen={openArtisanForm}
                content={renderArtisanForm()}
                onClose={(): void => setOpenArtisanForm(false)}
            />
        </Box>
    );
}
