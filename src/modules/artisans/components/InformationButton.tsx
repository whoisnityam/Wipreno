import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { SaveArtisanForms } from '../pages/SaveArtisanForms';
import {
    removeArtisanUser,
    deleteProfessionByIds,
    getArtisanById,
    getProfessionByUserId
} from '../services/artisanService';
import { ModalContainer } from '../../../components/ModalContainer';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { ArtisanContext } from '../layout/ArtisanDetailLayout';
import { User } from '../../profile/models/User';
import { UserContext } from '../../../provider/UserProvider';
import { getUserAccessByUserId, removeAccess } from '../../projects/services/UserAccessService';

export function InformationButtons(): React.ReactElement {
    const theme = useTheme();
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useContext(UserContext).user;
    const artisanContext = useContext(ArtisanContext);
    const [openArtisanForm, setOpenArtisanForm] = useState<boolean>(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState<boolean>(false);
    const [artisanId, setArtisanId] = useState<string>('');
    const [artisan, setArtisan] = useState<User>();
    const [profession, setProfession] = useState<ArtisanProfession[]>([]);
    useEffect(() => {
        if (id) {
            setArtisanId(id);
        }
    }, [id]);

    const openSuccessModal = (): void => {
        artisanContext?.refreshData();
    };

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
            const res = await getUserAccessByUserId(artisan?.id!);
            if (res) {
                for (const ele of res) {
                    await removeAccess(ele.id);
                }
            }
        }
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
        <Box display={'flex'}>
            <Button
                variant={'outlined'}
                color={'secondary'}
                onClick={(): void => setOpenArtisanForm(true)}>
                {t('modifyButtonTitle')}
            </Button>
            <Box width={'20px'} />
            <Button
                variant={'outlined'}
                onClick={(): void => setOpenDeleteAlert(true)}
                sx={{
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    ':hover': {
                        borderColor: theme.palette.error.main
                    }
                }}>
                {t('deleteButtonTitle')}
            </Button>
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
                secondaryButton={t('cancelButtonTitle')}
                secondaryButtonType={'text'}
            />
            <ModalContainer
                isModalOpen={openArtisanForm}
                content={renderArtisanForm()}
                onClose={(): void => setOpenArtisanForm(false)}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={deleteSuccessModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('youWillRedirectToArtisans')}
            />
        </Box>
    );
}
