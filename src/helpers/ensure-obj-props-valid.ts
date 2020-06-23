import errors from '@feathersjs/errors';

export const ensureObjPropsValid = (
  obj: any,
  props: string[],
  allowNone?: boolean
) => {
  const keys = Object.keys(obj);
  const valid = keys.every(
    (key) => props.includes(key) && typeof obj[key] === 'string'
  );

  if (!valid || (keys.length === 0 && !allowNone)) {
    throw new errors.BadRequest(
      'User info is not valid. (authLocalManagement)',
      {
        errors: { $className: 'badParams' },
      }
    );
  }
};
