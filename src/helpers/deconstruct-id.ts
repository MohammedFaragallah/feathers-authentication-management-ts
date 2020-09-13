import errors from '@feathersjs/errors';
import { Token } from '../types';

export const deconstructId = (token: Token) => {
	if (!token.includes('___')) {
		throw new errors.BadRequest('Token is not in the correct format.', {
			errors: { $className: 'badParams' },
		});
	}

	return token.slice(0, token.indexOf('___'));
};
