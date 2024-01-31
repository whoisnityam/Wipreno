import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'yup-phone';
import { ConsultationFormStepOne } from './ConsultationFormStepOne';
import { ConsultationFormStepTwo } from './ConsultationFromStepTwo';
import { Lot } from '../../models/Lot';
import { UserContext } from '../../../../provider/UserProvider';
import {
    addConsultation,
    addConsultationDocument,
    addConsultationSlot,
    sendConsultationEmail,
    sendManagerConsultationEmail
} from '../../services/ConsultationServices';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { AddConsultation } from '../../models/AddConsultation';
import { CreateConsultationForm } from '../../models/CreateConsultationForm';
import { Slot } from '../../models/Slot';
import { useTranslation } from 'react-i18next';
import { APP_BASE_URL } from '../../../../services/ApiService';
import { Consultation } from '../../models/Consultation';
import { FileData } from '../../models/FileData';

interface CreateProjectFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
}

export function CreateConsultationForms({
    handleCloseForm,
    handleOpenSuccess
}: CreateProjectFormsProps): React.ReactElement {
    const { t } = useTranslation();
    const mountedRef = useRef(true);
    const project = useContext(ProjectContext)?.project;
    const [currentStep, setCurrentStep] = useState<number>(0);
    const user = useContext(UserContext);
    const [formData, setFormData] = useState<CreateConsultationForm>({
        lots: [],
        selectedArtisans: [],
        description: '',
        file: null,
        slots: []
    });

    const nextStep = (): void => {
        setCurrentStep(currentStep + 1);
    };

    const previousStep = (): void => {
        setCurrentStep(currentStep - 1);
    };

    const getUrl = (consultationId: string): string => {
        return APP_BASE_URL + '/consultation-response' + '?consultationId=' + consultationId;
    };

    const getVisitDate = (visitDate: string): string => {
        const today = new Date(visitDate);
        return today.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const submitForm = async (): Promise<void | null> => {
        if (user && project) {
            const { description, selectedArtisans } = formData;

            const artisanDict: {
                [emailId: string]: {
                    lotName: string;
                    link: string;
                }[];
            } = {};

            // lotName as key, list of artisans under lot as value
            const managerDict: { [lotName: string]: string[] } = {};

            interface SlotData {
                visitDate: string;
                slotStart: string;
                slotEnd: string;
            }
            const slotData: SlotData[] = [];

            formData.lots.forEach((lot) => {
                managerDict[lot.title] = [];
            });

            for (const artisan of selectedArtisans) {
                if (!(artisan.artisan.email in artisanDict)) {
                    artisanDict[artisan.artisan.email] = [];
                }

                const data: AddConsultation = {
                    lot_id: artisan.lotId,
                    artisian_id: artisan.artisan.id,
                    description,
                    project_id: project.id
                };
                const consultationRes: Consultation = await addConsultation(data, user.user!.id);
                const currentLot = formData.lots.filter((item) => {
                    if (item.id === data.lot_id) return item;
                });

                const artisanFullName = `${artisan.artisan.first_name} ${artisan.artisan.last_name}`;
                managerDict[currentLot[0].title].push(artisanFullName);

                artisanDict[artisan.artisan.email].push({
                    lotName: currentLot[0].title,
                    link: getUrl(consultationRes.id)
                });

                if (formData.file) {
                    addConsultationDocument(formData.file, consultationRes.id);
                }
                for (const slot of formData.slots) {
                    await addConsultationSlot(slot, consultationRes.id);
                    const startTime = new Date(slot.start_time);
                    const endTime = new Date(slot.end_time);
                    slotData.push({
                        visitDate: getVisitDate(slot.visit_date),
                        slotStart: `${startTime.getHours()}:${startTime.getMinutes()}`,
                        slotEnd: `${endTime.getHours()}:${endTime.getMinutes()}`
                    });
                }
            }

            for (const [email, lotsData] of Object.entries(artisanDict)) {
                await sendConsultationEmail(
                    email,
                    `${t('consultationForProject')} ${project.name}`,
                    project.name,
                    project.enterprise_id.name,
                    lotsData
                );
            }

            // Get unique slots
            const flags: { [fullData: string]: boolean } = {},
                uniqueSlotData: SlotData[] = [];
            slotData.forEach((slot) => {
                const fullData = `${slot.visitDate}${slot.slotStart}${slot.slotEnd}`;
                if (fullData in flags) return;
                flags[fullData] = true;
                uniqueSlotData.push(slot);
            });

            // Condense slot data
            const condensedSlotData: {
                [visitDate: string]: {
                    slotStart: string;
                    slotEnd: string;
                }[];
            } = {};

            uniqueSlotData.forEach((slot) => {
                if (!(slot.visitDate in condensedSlotData)) {
                    condensedSlotData[slot.visitDate] = [];
                }
                condensedSlotData[slot.visitDate].push({
                    slotStart: slot.slotStart,
                    slotEnd: slot.slotEnd
                });
            });

            // Delete lots with no artisans
            const tempManagerDict: {
                [lotName: string]: string[];
            } = { ...managerDict };
            for (const lotName in tempManagerDict) {
                if (lotName in managerDict && managerDict[lotName].length === 0) {
                    delete managerDict[lotName];
                }
            }

            await sendManagerConsultationEmail(
                project.manager_id.email,
                condensedSlotData,
                t('confirmationOfSendingConsultation'),
                managerDict
            );
        }
    };

    useEffect(() => {
        const handleFormSubmit = async (): Promise<void> => {
            if (
                currentStep === 0 &&
                formData.lots.length > 0 &&
                formData.selectedArtisans.length > 0
            ) {
                nextStep();
            }
            if (currentStep === 1) {
                submitForm();
                handleCloseForm();
                handleOpenSuccess();
            }
        };
        handleFormSubmit();
        return (): void => {
            mountedRef.current = false;
        };
    }, [formData]);

    const CurrentForm = (): React.ReactElement => {
        switch (currentStep) {
            case 0:
                return (
                    <ConsultationFormStepOne
                        initialValues={{
                            lots: formData.lots,
                            selectedArtisan: formData.selectedArtisans
                        }}
                        onSubmit={(data: { lots: Lot[]; selectedArtisans: [] }): void => {
                            setFormData({
                                ...formData,
                                lots: [...data.lots],
                                selectedArtisans: [...data.selectedArtisans]
                            });
                            nextStep();
                        }}
                        onClose={handleCloseForm}
                    />
                );
            case 1:
                return (
                    <ConsultationFormStepTwo
                        initialValues={{
                            description: formData.description,
                            file: formData.file,
                            slots: formData.slots
                        }}
                        onSubmit={(data: {
                            description: string;
                            slots: Slot[];
                            file: FileData;
                        }): void => {
                            setFormData({
                                ...formData,
                                description: data.description,
                                slots: [...data.slots],
                                file: data.file
                            });
                            nextStep();
                        }}
                        onBackClick={previousStep}
                    />
                );
            default:
                return <></>;
        }
    };

    return (
        <Box>
            <>{CurrentForm()}</>
        </Box>
    );
}
