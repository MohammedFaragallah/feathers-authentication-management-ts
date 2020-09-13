import errors from '@feathersjs/errors';
import makeDebug from 'debug';
import {
	comparePasswords,
	ensureObjPropsValid,
	getLongToken,
	getShortToken,
	getUserData,
	notifier,
} from './helpers';
import { Options, Password, User } from './types';

const debug = makeDebug('authLocalManagement:identityChange');

export const identityChange = async (
	options: Options,
	identifyUser: User,
	password: Password,
	changesIdentifyUser: User,
) => {
	debug('identityChange', password, changesIdentifyUser);
	const usersService = options.app.service(options.service);
	const usersServiceIdName = usersService.id;

	ensureObjPropsValid(identifyUser, options.identifyUserProps);
	ensureObjPropsValid(changesIdentifyUser, options.identifyUserProps);

	const users = await usersService.find({ query: identifyUser });
	const user1 = getUserData(users);

	try {
		await comparePasswords(password, user1.password);
	} catch (err) {
		throw new errors.BadRequest('Password is incorrect.', {
			errors: {
				password: 'Password is incorrect.',
				$className: 'badParams',
			},
		});
	}

	const user2 = await usersService.patch(user1[usersServiceIdName], {
		verifyExpires: Date.now() + options.delay,
		verifyToken: await getLongToken(options.longTokenLen),
		verifyShortToken: await getShortToken(
			options.shortTokenLen,
			options.shortTokenDigits,
		),
		verifyChanges: changesIdentifyUser,
	});

	const user3 = await notifier(options.notifier, 'identityChange', user2, null);
	return options.sanitizeUserForClient(user3);
};
