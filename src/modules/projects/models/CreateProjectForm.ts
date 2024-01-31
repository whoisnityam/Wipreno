export interface CreateProjectForm {
    name: string;
    description: string;
    projectManager: string;
    priority: string;
    clientLastName: string;
    clientFirstName: string;
    email: string;
    phoneNumber: string;
    status: string;
    address: string;
    postalCode: string;
    city: string;
    budget: string;
    startOfWork: Date | undefined;
    userId: string;
    companyName: string;
    createdDate: number;
    enterprise: string;
    progressStatus: string;
}
