import { User } from '../../profile/models/User';

export interface ArtisanProfession {
    id: string;
    user_id: User;
    profession: string;
    created_at: Date;
    created_by: User;
    modified_at: Date;
    modified_by: User;
}
