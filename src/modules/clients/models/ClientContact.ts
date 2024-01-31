import { User } from '../../profile/models/User';

export interface ClientContact {
    id: string;
    created_at: Date;
    created_by: User;
    modified_at: Date;
    modified_by: User;
    user_id: User;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_deleted: boolean;
}
