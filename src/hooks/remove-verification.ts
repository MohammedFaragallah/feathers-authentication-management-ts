import { checkContext, getItems, replaceItems } from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';
import { User } from '../types';

export const removeVerification = (ifReturnTokens?: boolean) => (
  context: HookContext
) => {
  checkContext(context, 'after');
  // Retrieve the items from the hook
  let users = getItems(context);
  if (!users) return;
  const isArray = Array.isArray(users);
  users = isArray ? users : [users];

  users.forEach((user: User) => {
    if (!('isVerified' in user) && context.method === 'create') {
      /* eslint-disable no-console */
      console.warn(
        'Property isVerified not found in user properties. (removeVerification)'
      );
      console.warn(
        "Have you added authManagement's properties to your model? (Refer to README.md)"
      );
      console.warn('Have you added the addVerification hook on users::create?');
      /* eslint-enable */
    }

    if (context.params.provider && user) {
      // noop if initiated by server
      delete user.verifyExpires;
      delete user.resetExpires;
      delete user.verifyChanges;
      if (!ifReturnTokens) {
        delete user.verifyToken;
        delete user.verifyShortToken;
        delete user.resetToken;
        delete user.resetShortToken;
      }
    }
  });
  // Replace the items within the hook
  replaceItems(context, isArray ? users : users[0]);
};
