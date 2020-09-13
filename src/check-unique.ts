import errors from '@feathersjs/errors';
import makeDebug from 'debug';
import isNil from 'lodash/isNil';
import { Options, Meta, User, OwnId } from './types';

const debug = makeDebug('authLocalManagement:checkUnique');

// This module is usually called from the UI to check username, email, etc. are unique.
export const checkUnique = async (
	options: Options,
	identifyUser: User,
	ownId: OwnId,
	meta: Meta,
) => {
	debug('checkUnique', identifyUser, ownId, meta);
	const usersService = options.app.service(options.service);
	const usersServiceIdName = usersService.id;
	const allProps = [];

	const keys = Object.keys(identifyUser).filter(
		(key) => !isNil(identifyUser[key]),
	);

	try {
		for (let i = 0, len = keys.length; i < len; i++) {
			const prop = keys[i];
			const users = await usersService.find({
				query: { [prop]: identifyUser[prop].trim() },
			});
			const items = Array.isArray(users) ? users : users.data;
			const isNotUnique =
				items.length > 1 ||
				(items.length === 1 && items[0][usersServiceIdName] !== ownId);
			isNotUnique && allProps.push(prop);
		}
	} catch (err) {
		throw new errors.BadRequest(
			meta.noErrMsg ? undefined : 'checkUnique unexpected error.',
			{ errors: { msg: err.message, $className: 'unexpected' } },
		);
	}

	const errProps = allProps.filter((prop) => prop);

	if (errProps.length) {
		const errs: any = {};
		errProps.forEach((prop) => {
			errs[prop] = 'Already taken.';
		});

		throw new errors.BadRequest(
			meta.noErrMsg ? undefined : 'Values already taken.',
			{ errors: errs },
		);
	}

	return identifyUser;
};
