import makeDebug from 'debug';
import { sanitizeUserForNotifier } from './sanitize-user-for-notifier';
import { Types, User, Notifier, NotifierOptions } from '../types';

const debug = makeDebug('authLocalManagement:notifier');

export const notifier = async (
  optionsNotifier: Notifier,
  type: Types,
  user: User,
  notifierOptions?: NotifierOptions
) => {
  debug('notifier', type);
  await optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions);
  return user;
};
