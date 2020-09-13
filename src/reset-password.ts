import errors from '@feathersjs/errors';
import makeDebug from 'debug';

import { comparePasswords } from './helpers';
import { deconstructId } from './helpers';
import { ensureObjPropsValid } from './helpers';
import { ensureValuesAreStrings } from './helpers';
import { getUserData } from './helpers';
import { hashPassword } from './helpers';
import { notifier } from './helpers';
import { Options, Types, User, Tokens, Token, Password } from './types';
import { Params } from '@feathersjs/feathers';

const debug = makeDebug('authLocalManagement:resetPassword');

export const resetPwdWithLongToken = async (
	options: Options,
	resetToken: Token,
	password: Password,
	field: string,
) => {
	ensureValuesAreStrings(resetToken, password);

	return resetPassword(
		options,
		{ resetToken },
		{ resetToken },
		password,
		field,
	);
};

export const resetPwdWithShortToken = async (
	options: Options,
	resetShortToken: Token,
	identifyUser: User,
	password: Password,
	field: string,
) => {
	ensureValuesAreStrings(resetShortToken, password);
	ensureObjPropsValid(identifyUser, options.identifyUserProps);

	return resetPassword(
		options,
		identifyUser,
		{ resetShortToken },
		password,
		field,
	);
};

const resetPassword = async (
	options: Options,
	query: Params['query'],
	tokens: Tokens,
	password: Password,
	field: string,
) => {
	debug('resetPassword', query, tokens, password);
	const usersService = options.app.service(options.service);
	const usersServiceIdName = usersService.id;
	const promises: Promise<unknown>[] = [];
	let users;

	if (tokens.resetToken) {
		const id = deconstructId(tokens.resetToken);
		users = await usersService.get(id);
	} else if (tokens.resetShortToken) {
		users = await usersService.find({ query });
	} else {
		throw new errors.BadRequest(
			'resetToken and resetShortToken are missing. (authLocalManagement)',
			{
				errors: { $className: 'missingToken' },
			},
		);
	}

	const checkProps = options.skipIsVerifiedCheck
		? ['resetNotExpired']
		: ['resetNotExpired', 'isVerified'];
	const user1 = getUserData(users, checkProps);

	Object.keys(tokens).forEach((key) => {
		promises.push(
			comparePasswords(tokens[key], user1[key]).catch(
				() =>
					new errors.BadRequest(
						'Reset Token is incorrect. (authLocalManagement)',
						{
							errors: { $className: 'incorrectToken' },
						},
					),
			),
		);
	});

	try {
		await Promise.all(promises);
	} catch (err) {
		await usersService.patch(user1[usersServiceIdName], {
			resetToken: null,
			resetShortToken: null,
			resetExpires: null,
		});

		new errors.BadRequest(
			'Invalid token. Get for a new one. (authLocalManagement)',
			{
				errors: { $className: 'invalidToken' },
			},
		);
	}

	const user2 = await usersService.patch(user1[usersServiceIdName], {
		password: await hashPassword(options.app, password, field),
		resetToken: null,
		resetShortToken: null,
		resetExpires: null,
	});

	const user3 = await notifier(options.notifier, Types.resetPwd, user2);
	return options.sanitizeUserForClient(user3);
};
