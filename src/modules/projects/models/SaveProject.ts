export interface SaveProject {
    enterprise_id?: string;
    name: string;
    managerId: string;
    priority: string;
    status_id: string;
    address: string;
    postal_code: number;
    client_id: string;
    city: string;
    description: string;
    budget: number;
    start_date: Date;
    created_at: Date;
    created_by: string;
    modified_at: Date;
    modified_by: string;
    is_deleted: boolean;
}
