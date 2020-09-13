import makeDebug from 'debug';
import {
	concatIDAndHash,
	ensureObjPropsValid,
	getLongToken,
	getShortToken,
	getUserData,
	hashPassword,
	notifier,
} from './helpers';
import { NotifierOptions, Options, User } from './types';

const debug = makeDebug('authLocalManagement:sendResetPwd');

export const sendResetPwd = async (
	options: Options,
	identifyUser: User,
	notifierOptions: NotifierOptions,
	field: string,
) => {
	debug('sendResetPwd');
	const usersService = options.app.service(options.service);
	const usersServiceIdName = usersService.id;

	ensureObjPropsValid(identifyUser, options.identifyUserProps);

	const users = await usersService.find({ query: identifyUser });
	const user1 = getUserData(
		users,
		options.skipIsVerifiedCheck ? [] : ['isVerified'],
	);

	const user2 = Object.assign(user1, {
		resetExpires: Date.now() + options.resetDelay,
		resetToken: concatIDAndHash(
			user1[usersServiceIdName],
			await getLongToken(options.longTokenLen),
		),
		resetShortToken: await getShortToken(
			options.shortTokenLen,
			options.shortTokenDigits,
		),
	});

	notifier(options.notifier, 'sendResetPwd', user2, notifierOptions);
	const user3 = await usersService.patch(user2[usersServiceIdName], {
		resetExpires: user2.resetExpires,
		resetToken: await hashPassword(options.app, user2.resetToken, field),
		resetShortToken: await hashPassword(
			options.app,
			user2.resetShortToken,
			field,
		),
	});

	return options.sanitizeUserForClient(user3);
};
