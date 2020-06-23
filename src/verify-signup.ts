import errors from '@feathersjs/errors';
import makeDebug from 'debug';

import { ensureObjPropsValid } from './helpers';
import { ensureValuesAreStrings } from './helpers';
import { getUserData } from './helpers';
import { notifier } from './helpers';
import { Types, User, Options, Tokens, Token } from './types';
import { Params } from '@feathersjs/feathers';

const debug = makeDebug('authLocalManagement:verifySignup');

export const verifySignupWithLongToken = async (
  options: Options,
  verifyToken: Token
) => {
  ensureValuesAreStrings(verifyToken);

  return await verifySignup(options, { verifyToken }, { verifyToken });
};

export const verifySignupWithShortToken = async (
  options: Options,
  verifyShortToken: Token,
  identifyUser: User
) => {
  ensureValuesAreStrings(verifyShortToken);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  return await verifySignup(options, identifyUser, { verifyShortToken });
};

const verifySignup = async (
  options: Options,
  query: Params['query'],
  tokens: Tokens
) => {
  debug('verifySignup', query, tokens);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  const users = await usersService.find({ query });
  const user1 = getUserData(users, [
    'isNotVerifiedOrHasVerifyChanges',
    'verifyNotExpired',
  ]);

  const eraseVerifyProps = async (
    user: User,
    isVerified: boolean,
    verifyChanges?: string[]
  ) => {
    const patchToUser = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {},
    });

    return await usersService.patch(user[usersServiceIdName], patchToUser, {});
  };

  if (!Object.keys(tokens).every((key) => tokens[key] === user1[key])) {
    await eraseVerifyProps(user1, user1.isVerified);

    throw new errors.BadRequest(
      'Invalid token. Get for a new one. (authLocalManagement)',
      { errors: { $className: 'badParam' } }
    );
  }

  const user2 = await eraseVerifyProps(
    user1,
    user1.verifyExpires > Date.now(),
    user1.verifyChanges || {}
  );
  const user3 = await notifier(options.notifier, Types.verifySignup, user2);
  return options.sanitizeUserForClient(user3);
};
