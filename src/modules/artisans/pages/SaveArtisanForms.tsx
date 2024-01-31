import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { FormStepOne } from '../components/FormStepOne';
import { User } from '../../profile/models/User';
import { UserContext } from '../../../provider/UserProvider';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { ArtisanFormData } from '../models/ArtisanFormData';
import { equals } from '../../../utils';
import {
    deleteProfessionByIds,
    saveArtisan,
    saveProfessions,
    updateArtisan
} from '../services/artisanService';
import { DirectusError, ErrorCode } from '../../error/models/ErrorCode';

interface SaveArtisanFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    artisan?: User;
    profession?: ArtisanProfession[];
}

export function SaveArtisanForms({
    handleCloseForm,
    handleOpenSuccess,
    artisan,
    profession
}: SaveArtisanFormsProps): React.ReactElement {
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModify, setIsModify] = useState<boolean>(false);
    const [userExistsError, setUserExistsError] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    useEffect(() => {
        if (artisan && profession) {
            setIsModify(true);
        }
    }, [artisan, profession]);

    const professionItems: string[] =
        profession?.map((item) => {
            return item.profession;
        }) ?? [];

    const initialData: ArtisanFormData = {
        companyName: artisan?.company_name ?? '',
        address: artisan?.address ?? '',
        department: artisan?.artisan_id?.department ?? '',
        city: artisan?.city ?? '',
        nameOfTheContact: artisan?.last_name ?? '',
        contactFirstName: artisan?.first_name ?? '',
        artisanId: artisan?.id ?? '',
        email_id: artisan?.email ?? '',
        phoneNumber: artisan?.phone ?? '',
        professionList: professionItems ?? [],
        remark: artisan?.artisan_id?.remark ?? '',
        rib: artisan?.artisan_id?.rib ?? null,
        decennialInsurance: artisan?.artisan_id?.decennial_insurance ?? null
    };

    const submitForm = async (formData: ArtisanFormData): Promise<void> => {
        if (!artisan && !profession && currentUser.user && formData) {
            setLoading(true);
            await saveArtisan(formData, currentUser.user.enterprises[0].enterprise_id.id)
                .then(async (artisanUser) => {
                    if (artisanUser) {
                        await saveProfessions(artisanUser.id, formData.professionList);
                        setLoading(false);
                        openSuccessModal();
                    }
                })
                .catch((error: DirectusError) => {
                    if (error.extensions.code === ErrorCode.RECORD_NOTUNIQUE) {
                        setUserExistsError(true);
                    }
                });
        } else if (artisan || profession) {
            setLoading(true);
            const artisanUser = await updateArtisan(formData);
            if (artisanUser) {
                if (formData.professionList !== professionItems) {
                    await deleteProfessionByIds(profession!.map((item) => item.id));
                    await saveProfessions(artisanUser.id, formData.professionList);
                }
                setLoading(false);
                openSuccessModal();
            }
        }
    };

    const saveData = async (data: ArtisanFormData): Promise<void> => {
        const isEquals = equals(data, initialData);
        if (
            (!isEquals && data.email_id !== '') ||
            (!isEquals && data.email_id !== '' && !artisan)
        ) {
            await submitForm(data);
        } else {
            openSuccessModal();
        }
    };

    const CurrentForm = (): React.ReactElement => {
        return (
            <FormStepOne
                initialValues={initialData}
                error={userExistsError}
                onSubmit={async (data: ArtisanFormData): Promise<void> => {
                    await saveData(data);
                }}
                closeForm={handleCloseForm}
                loading={loading}
                isModify={isModify}
            />
        );
    };
    return (
        <Box>
            <>{CurrentForm()}</>
        </Box>
    );
}
