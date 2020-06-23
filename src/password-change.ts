import errors from '@feathersjs/errors';
import makeDebug from 'debug';
import { comparePasswords } from './helpers';
import { ensureObjPropsValid } from './helpers';
import { ensureValuesAreStrings } from './helpers';
import { getUserData } from './helpers';
import { hashPassword } from './helpers';
import { notifier } from './helpers';
import { Types, Options, User, Password } from './types';

const debug = makeDebug('authLocalManagement:passwordChange');

export const passwordChange = async (
  options: Options,
  identifyUser: User,
  oldPassword: Password,
  password: Password,
  field: string
) => {
  debug('passwordChange', oldPassword, password);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  ensureValuesAreStrings(oldPassword, password);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  const users = await usersService.find({ query: identifyUser });
  const user1 = getUserData(users);

  try {
    await comparePasswords(oldPassword, user1.password);
  } catch (err) {
    throw new errors.BadRequest('Current password is incorrect.', {
      errors: { oldPassword: 'Current password is incorrect.' },
    });
  }

  const user2 = await usersService.patch(user1[usersServiceIdName], {
    password: await hashPassword(options.app, password, field),
  });

  const user3 = await notifier(options.notifier, Types.passwordChange, user2);
  return options.sanitizeUserForClient(user3);
};
