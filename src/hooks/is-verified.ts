import errors from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';

export const isVerified = () => (context: HookContext) => {
  checkContext(context, 'before');

  if (!context.params.user || !context.params.user.isVerified) {
    throw new errors.BadRequest("User's email is not yet verified.");
  }
};
