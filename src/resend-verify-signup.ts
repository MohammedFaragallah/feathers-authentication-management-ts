import makeDebug from 'debug';
import { ensureObjPropsValid } from './helpers';
import { getLongToken } from './helpers';
import { getShortToken } from './helpers';
import { getUserData } from './helpers';
import { notifier } from './helpers';
import { Types, Options, User, NotifierOptions } from './types';

const debug = makeDebug('authLocalManagement:resendVerifySignup');

// {email}, {cellphone}, {verifyToken}, {verifyShortToken},
// {email, cellphone, verifyToken, verifyShortToken}
export const resendVerifySignup = async (
  options: Options,
  identifyUser: User,
  notifierOptions: NotifierOptions
) => {
  debug('identifyUser=', identifyUser);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  ensureObjPropsValid(
    identifyUser,
    options.identifyUserProps.concat('verifyToken', 'verifyShortToken')
  );

  const users = await usersService.find({ query: identifyUser });
  const user1 = getUserData(users, ['isNotVerified']);

  const user2 = await usersService.patch(user1[usersServiceIdName], {
    isVerified: false,
    verifyExpires: Date.now() + options.delay,
    verifyToken: await getLongToken(options.longTokenLen),
    verifyShortToken: await getShortToken(
      options.shortTokenLen,
      options.shortTokenDigits
    ),
  });

  const user3 = await notifier(
    options.notifier,
    Types.resendVerifySignup,
    user2,
    notifierOptions
  );
  return options.sanitizeUserForClient(user3);
};
