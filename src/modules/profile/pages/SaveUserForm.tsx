import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { User } from '../models/User';
import { UserContext } from '../../../provider/UserProvider';
import { AddUserForm } from '../components/AddUserForm';
import { createUser, updateUser } from '../services/UserManagementService';

interface SaveUserFormProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    selectedUser?: User;
}

export function SaveUserForm({
    handleCloseForm,
    handleOpenSuccess,
    selectedUser
}: SaveUserFormProps): React.ReactElement {
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModify, setIsModify] = useState<boolean>(false);

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const [formData, setFormData] = useState({
        nameOfTheContact: '',
        contactFirstName: '',
        emailFieldLabel: ''
    });

    useEffect(() => {
        if (selectedUser) {
            setIsModify(true);
            setFormData({
                nameOfTheContact: selectedUser?.last_name ?? '',
                contactFirstName: selectedUser?.first_name ?? '',
                emailFieldLabel: selectedUser?.email ?? ''
            });
        }
    }, [selectedUser]);

    const sameData = (): boolean => {
        return (
            formData.contactFirstName === selectedUser?.first_name &&
            formData.emailFieldLabel === selectedUser?.email &&
            formData.nameOfTheContact === selectedUser?.last_name
        );
    };

    const submitForm = async (): Promise<void> => {
        if (!selectedUser && currentUser && formData) {
            setLoading(true);
            const { nameOfTheContact, contactFirstName, emailFieldLabel } = formData;
            const res = await createUser(
                nameOfTheContact,
                contactFirstName,
                emailFieldLabel,
                currentUser.user!.enterprises.at(0)!.enterprise_id.id
            );
            if (res) {
                setLoading(false);
                openSuccessModal();
            }
        } else if (selectedUser) {
            setLoading(true);
            const { nameOfTheContact, contactFirstName } = formData;
            const res = await updateUser(nameOfTheContact, contactFirstName, selectedUser.id);
            if (res) {
                setLoading(false);
                openSuccessModal();
            }
        }
    };

    useEffect(() => {
        const response = sameData();
        if (!response && formData.emailFieldLabel !== '') {
            //when modify
            submitForm();
        } else if (!sameData() && formData.emailFieldLabel !== '' && !selectedUser) {
            //when add
            submitForm();
        }
    }, [formData]);
    const CurrentForm = (): React.ReactElement => {
        return (
            <AddUserForm
                initialValues={{
                    nameOfTheContact: formData.nameOfTheContact,
                    contactFirstName: formData.contactFirstName,
                    emailFieldLabel: formData.emailFieldLabel
                }}
                onSubmit={(data: {
                    nameOfTheContact: string;
                    contactFirstName: string;
                    emailFieldLabel: string;
                }): void => {
                    setFormData({
                        ...formData,
                        nameOfTheContact: data.nameOfTheContact,
                        contactFirstName: data.contactFirstName,
                        emailFieldLabel: data.emailFieldLabel
                    });
                }}
                closeForm={handleCloseForm}
                loading={loading}
                isModify={isModify}
            />
        );
    };
    return (
        <Box>
            <CurrentForm />
        </Box>
    );
}
