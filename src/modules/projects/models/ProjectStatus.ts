export interface ProjectStatus {
    id: string;
    name: string;
    enterprise_id: string;
    is_default_status: boolean;
    priority: number;
}

export const StatusFields = ['id', 'name', 'enterprise_id', 'is_default_status', 'priority'];
