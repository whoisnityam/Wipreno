import { Box } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../provider/UserProvider';
import { ArtisanFormData } from '../../../artisans/models/ArtisanFormData';
import { saveArtisan } from '../../../artisans/services/artisanService';
import { addClient } from '../../../clients/services/ClientService';
import { CreateNewUserFormFields } from './CreateNewUserFormFields';
import { CreateAccess } from '../../services/UserAccessService';

interface CreateNewUserFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    createExistingUser: boolean;
    project: string;
}
export function CreateNewUserForms({
    handleCloseForm,
    handleOpenSuccess,
    createExistingUser,
    project
}: CreateNewUserFormsProps): React.ReactElement {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [submit, setSubmit] = useState<boolean>(false);
    const currentUser = useContext(UserContext);

    const nextStep = (): void => {
        if (currentStep !== 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep);
        }
    };

    const previousStep = (): void => {
        setCurrentStep(currentStep - 1);
    };

    const [formData, setFormData] = useState({
        typeOfGuest: '',
        lastName: '',
        firstName: '',
        email: '',
        planning: false,
        reports: false,
        discussion: false,
        documents: false,
        selectedUser: ''
    });

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const submitForm = async (): Promise<void> => {
        const {
            typeOfGuest,
            lastName,
            firstName,
            email,
            planning,
            reports,
            discussion,
            documents,
            selectedUser
        } = formData;
        if (formData.email) {
            if (typeOfGuest === 'Artisan') {
                const initialData: ArtisanFormData = {
                    companyName: '',
                    address: '',
                    department: '',
                    city: '',
                    nameOfTheContact: lastName,
                    contactFirstName: firstName,
                    artisanId: '',
                    email_id: email,
                    phoneNumber: '',
                    professionList: [],
                    remark: '',
                    rib: null,
                    decennialInsurance: null
                };
                await saveArtisan(
                    initialData,
                    currentUser.user?.enterprises.at(0)?.enterprise_id?.id!
                ).then(async (artisan) => {
                    if (artisan) {
                        const res = await CreateAccess(
                            project,
                            artisan.id,
                            planning,
                            reports,
                            discussion,
                            documents
                        );
                        if (res) {
                            openSuccessModal();
                        }
                    }
                });
            } else if (typeOfGuest === 'Client') {
                addClient(
                    null,
                    null,
                    null,
                    null,
                    lastName,
                    firstName,
                    email,
                    null,
                    currentUser.user!,
                    ''
                ).then(async (client) => {
                    if (client) {
                        const res = await CreateAccess(
                            project,
                            client.id,
                            planning,
                            reports,
                            discussion,
                            documents
                        );
                        if (res) {
                            openSuccessModal();
                        }
                    }
                });
            }
        } else if (formData.selectedUser) {
            const res = await CreateAccess(
                project,
                selectedUser,
                planning,
                reports,
                discussion,
                documents
            );
            if (res) {
                openSuccessModal();
            }
        }
    };

    useEffect(() => {
        if (submit) {
            submitForm();
        }
    }, [formData]);

    useEffect(() => {
        if (currentStep === 1) {
            setSubmit(true);
        } else {
            setSubmit(false);
        }
    }, [currentStep]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <CreateNewUserFormFields
                initialValues={{
                    typeOfGuest: formData.typeOfGuest,
                    lastName: formData.lastName,
                    firstName: formData.firstName,
                    email: formData.email,
                    planning: formData.planning,
                    reports: formData.reports,
                    discussion: formData.discussion,
                    documents: formData.documents,
                    selectedUser: formData.selectedUser
                }}
                onSubmit={(data: {
                    typeOfGuest: string;
                    lastName: string;
                    firstName: string;
                    email: string;
                    planning: boolean;
                    reports: boolean;
                    discussion: boolean;
                    documents: boolean;
                    selectedUser: string;
                }): void => {
                    setFormData({
                        ...formData,
                        typeOfGuest: data.typeOfGuest,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        planning: data.planning,
                        reports: data.reports,
                        discussion: data.discussion,
                        documents: data.documents,
                        selectedUser: data.selectedUser
                    });
                }}
                closeForm={handleCloseForm}
                nextStep={nextStep}
                currentStep={currentStep}
                previousStep={previousStep}
                createExistingUser={createExistingUser}
            />
        );
    };

    return <Box>{currentStep < 2 ? <CurrentForm /> : null}</Box>;
}
