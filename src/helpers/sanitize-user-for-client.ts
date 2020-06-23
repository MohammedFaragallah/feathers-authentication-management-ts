import { User } from '../types';

export const sanitizeUserForClient = (user1: User) => {
  const user = { ...user1 };

  delete user.password;
  delete user.verifyExpires;
  delete user.verifyToken;
  delete user.verifyShortToken;
  delete user.verifyChanges;
  delete user.resetExpires;
  delete user.resetToken;
  delete user.resetShortToken;

  return user;
};
