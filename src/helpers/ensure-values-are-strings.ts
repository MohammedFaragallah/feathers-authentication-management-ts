import errors from '@feathersjs/errors';

export const ensureValuesAreStrings = (...rest: string[]) => {
	if (!rest.every((str) => typeof str === 'string')) {
		throw new errors.BadRequest(
			'Expected string value. (authLocalManagement)',
			{
				errors: { $className: 'badParams' },
			},
		);
	}
};
