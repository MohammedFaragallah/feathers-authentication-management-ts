import { User } from '../types';

export const sanitizeUserForNotifier = (user1: User) => {
	const user = { ...user1 };

	delete user.password;
	return user;
};
