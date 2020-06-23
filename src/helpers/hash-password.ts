import { hooks } from '@feathersjs/authentication-local';
import { Application, HookContext } from '@feathersjs/feathers';
import { Password } from '../types';

export const hashPassword = async (
  app: Application,
  password: Password,
  field: string
) => {
  if (!field) throw new Error('Field is missing');

  const context = {
    type: 'before',
    data: { password },
    params: { provider: undefined },
    app,
  };

  const newContext = await hooks.hashPassword(field)(context as HookContext);
  return newContext.data.password;
};
