import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ModifyUserFormFields } from '../../components/userAccess/ModifyUserFormFields';
import { ProjectAccess } from '../../models/ProjectAccess';
import { ModifyAccess } from '../../services/UserAccessService';
import { updateUser } from '../../../profile/services/UserManagementService';
import { Role } from '../../../profile/models/Role';
import { useTranslation } from 'react-i18next';

interface FormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    selectedUser?: ProjectAccess | undefined;
}

export function SaveModifyForm({
    handleCloseForm,
    handleOpenSuccess,
    selectedUser
}: FormsProps): React.ReactElement {
    const { t } = useTranslation();
    const [loading, setloading] = useState<boolean>(false);

    const getRole = (): string => {
        const role = selectedUser?.user_id.role.name;
        if (role === Role.artisan) {
            return t('artisan');
        } else if (role === Role.client) {
            return t('client');
        } else {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        typeOfGuest: getRole() ?? '',
        lastName: selectedUser?.user_id.last_name ?? '',
        firstName: selectedUser?.user_id.first_name ?? '',
        email: selectedUser?.user_id.email ?? '',
        planning: selectedUser?.has_planning ?? false,
        reports: selectedUser?.has_reports ?? false,
        discussion: selectedUser?.has_discussions ?? false,
        documents: selectedUser?.has_documents ?? false
    });

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess(formData);
    };

    const sameData = (): boolean => {
        if (
            formData.lastName === selectedUser?.user_id.last_name &&
            formData.firstName === selectedUser?.user_id.first_name &&
            formData.planning === selectedUser.has_planning &&
            formData.reports === selectedUser.has_reports &&
            formData.discussion === selectedUser.has_discussions &&
            formData.documents === selectedUser.has_documents
        ) {
            return true;
        } else {
            return false;
        }
    };

    const submitForm = async (): Promise<void> => {
        setloading(true);
        const { lastName, firstName, planning, reports, discussion, documents, email } = formData;
        if (email) {
            const res = await updateUser(lastName, firstName, selectedUser?.user_id.id!);
            if (res) {
                await ModifyAccess(selectedUser?.id!, planning, reports, discussion, documents);
            }
        }
        setloading(false);
        openSuccessModal();
    };

    useEffect(() => {
        const response = sameData();
        if (!response && formData.email !== '') {
            submitForm();
        }
    }, [formData]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <ModifyUserFormFields
                initialValues={{
                    typeOfGuest: formData.typeOfGuest,
                    lastName: formData.lastName,
                    firstName: formData.firstName,
                    email: formData.email,
                    planning: formData.planning,
                    reports: formData.reports,
                    discussion: formData.discussion,
                    documents: formData.documents
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
                        documents: data.documents
                    });
                }}
                closeForm={handleCloseForm}
                loading={loading}
            />
        );
    };
    return (
        <Box>
            <>{CurrentForm()}</>
        </Box>
    );
}
