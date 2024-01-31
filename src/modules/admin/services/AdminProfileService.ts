import { User } from '../../profile/models/User';
import { UpdateAdmin } from '../models/UpdateAdmin';
import { UpdateUser } from '../../../services/DirectusService';

export const updateUserData = async (data: UpdateAdmin): Promise<User> => {
    return UpdateUser(data.id, {
        first_name: data.firstName,
        last_name: data.lastName
    });
};
