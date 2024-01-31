import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import 'yup-phone';
import { User, UserContextProps } from '../../profile/models/User';
import { UserContext } from '../../../provider/UserProvider';
import { addAccess, addProject, updateProject } from '../services/ProjectService';
import {
    getClientsByEnterpriseId,
    getProjectManagersByEnterpriseId
} from '../../profile/services/ProfileService';
import { ProjectStatus } from '../models/ProjectStatus';
import { getProjectStatusByEnterpriseId } from '../services/StatusService';
import { CreateProjectFormFields } from '../components/information/CreateProjectFormFields';
import { Project } from '../models/Project';
import { StatusOfClient } from '../../../constants';
import { addClient, modifySelectedClient } from '../../clients/services/ClientService';
import { convertToUiValue, postalCheck } from '../../../utils';
import { ProjectFormData } from '../models/ProjectFormData';

interface CreateProjectFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    project?: Project;
}

export function CreateProjectForms({
    handleCloseForm,
    handleOpenSuccess,
    project
}: CreateProjectFormsProps): React.ReactElement {
    const user: UserContextProps = useContext(UserContext);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [submit, setSubmit] = useState<boolean>(false);
    const [projectManagerList, setProjectManagerList] = useState<User[]>([]);
    const [clientList, setClientList] = useState<User[]>([]);
    const [statusList, setStatusList] = useState<ProjectStatus[]>([]);
    const [isModify, setIsModify] = useState<boolean>(false);
    const getClientStatus = (): string => {
        if (project && project.client_id !== null && project.client_id.company_name === '') {
            return StatusOfClient[0];
        } else {
            return StatusOfClient[1];
        }
    };

    const nextStep = (): void => {
        if (currentStep !== 2) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep);
        }
    };

    const previousStep = (): void => {
        setCurrentStep(currentStep - 1);
    };

    const openSuccessModal = (): void => {
        handleCloseForm();
        handleOpenSuccess();
    };

    const getProjectManagers = async (): Promise<void> => {
        if (user.user && user.user!.enterprises.at(0)!.enterprise_id.id) {
            const list: User[] = await getProjectManagersByEnterpriseId(
                user.user!.enterprises.at(0)!.enterprise_id.id
            );
            const res: ProjectStatus[] = await getProjectStatusByEnterpriseId(
                user.user!.enterprises.at(0)!.enterprise_id.id
            );
            if (list) {
                setProjectManagerList(list);
            }
            if (res && res.length > 0) {
                setStatusList([...res]);
            } else {
                setStatusList([]);
            }
        }
    };

    const getClients = async (): Promise<void> => {
        if (user.user && user.user!.enterprises?.at(0)?.enterprise_id) {
            const list: User[] = await getClientsByEnterpriseId(
                user.user!.enterprises!.at(0)!.enterprise_id.id
            );
            if (list) {
                setClientList(list);
            }
        }
    };

    useEffect(() => {
        getProjectManagers();
        getClients();
    }, [user.user]);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: project?.name ?? '',
        description: project?.description ?? '',
        projectManager: project?.manager_id,
        priority: project?.priority ?? '',
        progressStatus: project?.status_id,
        client: project?.client_id,
        clientLastName:
            project?.client_id && project?.client_id.last_name ? project?.client_id.last_name : '',
        clientFirstName:
            project?.client_id && project?.client_id.first_name
                ? project?.client_id.first_name
                : '',
        email: project?.client_id && project?.client_id.email ? project?.client_id.email : '',
        phoneNumber: project?.client_id && project?.client_id.phone ? project?.client_id.phone : '',
        status: project?.client_id ? getClientStatus() : '',
        address: project?.address ?? '',
        postalCode: postalCheck(project?.postal_code ?? '') ?? '',
        city: project?.city ?? '',
        budget: project?.budget ? convertToUiValue(project?.budget).toString() : '',
        enterprise: project?.enterprise_id.name ?? '',
        startOfWork: project?.start_date ?? undefined
    });

    useEffect(() => {
        if (project) {
            setIsModify(true);
        }
    }, [project]);

    const saveProject = async (client: User): Promise<void> => {
        const projectInfo = {
            id: project?.id ?? '',
            enterprise_id: user.user!.enterprises.at(0)!.enterprise_id,
            manager_id: formData.projectManager!,
            priority: formData.priority,
            status_id: formData.progressStatus!,
            address: formData.address,
            postal_code: formData.postalCode,
            city: formData.city,
            client_id: client,
            description: formData.description,
            budget: parseFloat(formData.budget),
            start_date: formData.startOfWork ? formData.startOfWork : new Date(),
            name: formData.name
        };
        if (isModify) {
            await updateProject(projectInfo);
        } else {
            const res = await addProject(projectInfo);
            if (res) {
                await addAccess(client.id, res.id, true);
            }
        }
    };

    const submitForm = async (): Promise<void> => {
        if (user.user && formData.projectManager) {
            if (!formData.client) {
                addClient(
                    null,
                    null,
                    null,
                    formData.status,
                    formData.clientLastName,
                    formData.clientFirstName,
                    formData.email,
                    formData.phoneNumber,
                    user.user,
                    formData.enterprise
                ).then(async (client) => {
                    await saveProject(client!);
                    openSuccessModal();
                });
            } else if (
                formData.clientFirstName !== formData.client.first_name ||
                formData.clientLastName !== formData.client.last_name ||
                formData.phoneNumber !== formData.client.phone
            ) {
                await modifySelectedClient(
                    formData.clientLastName,
                    formData.clientFirstName,
                    formData.phoneNumber,
                    formData.client.id
                ).then(async (client) => {
                    await saveProject(client!);
                    openSuccessModal();
                });
            } else {
                await saveProject(formData.client);
                openSuccessModal();
            }
        }
    };

    useEffect(() => {
        if (submit || (currentStep === 1 && isModify)) {
            submitForm();
        }
    }, [formData]);

    useEffect(() => {
        if (currentStep === 2) {
            setSubmit(true);
        } else {
            setSubmit(false);
        }
    }, [currentStep]);

    const CurrentForm = (): React.ReactElement => {
        return (
            <CreateProjectFormFields
                initialValues={formData}
                onSubmit={(data: ProjectFormData): void => {
                    setFormData({
                        ...data
                    });
                    if (currentStep === 2 || (currentStep === 0 && isModify)) {
                        nextStep();
                    }
                }}
                closeForm={handleCloseForm}
                nextStep={nextStep}
                currentStep={currentStep}
                previousStep={previousStep}
                isModify={isModify}
                managerList={[...projectManagerList]}
                clientList={[...clientList]}
                statusList={[...statusList]}
            />
        );
    };

    return <Box>{currentStep < 3 ? <CurrentForm /> : null}</Box>;
}
