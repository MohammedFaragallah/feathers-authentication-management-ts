import errors from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import makeDebug from 'debug';
import {
	ensureObjPropsValid,
	ensureValuesAreStrings,
	getUserData,
	hashPassword,
	notifier,
} from './helpers';
import { Changes, Options, Password, Token, Tokens, User } from './types';

const debug = makeDebug('authLocalMgnt:verifySignupSetPassword');

export const verifySignupSetPasswordWithLongToken = async (
	options: Options,
	verifyToken: Token,
	password: Password,
	field: string,
) => {
	ensureValuesAreStrings(verifyToken, password);

	const result = await verifySignupSetPassword(
		options,
		{ verifyToken },
		{ verifyToken },
		password,
		field,
	);

	return result;
};

export const verifySignupSetPasswordWithShortToken = async (
	options: Options,
	verifyShortToken: Token,
	identifyUser: User,
	password: Password,
	field: string,
) => {
	ensureValuesAreStrings(verifyShortToken, password);
	ensureObjPropsValid(identifyUser, options.identifyUserProps);

	const result = await verifySignupSetPassword(
		options,
		identifyUser,
		{
			verifyShortToken,
		},
		password,
		field,
	);

	return result;
};

async function verifySignupSetPassword(
	options: Options,
	query: Params['query'],
	tokens: Tokens,
	password: Password,
	field: string,
) {
	debug('verifySignupSetPassword', query, tokens, password);
	const usersService = options.app.service(options.service);
	const usersServiceIdName = usersService.id;

	const users = await usersService.find({ query });
	const user1 = getUserData(users, [
		'isNotVerifiedOrHasVerifyChanges',
		'verifyNotExpired',
	]);

	const eraseVerifyPropsSetPassword = async (
		user: User,
		isVerified: boolean,
		verifyChanges: Changes,
		password: Password,
		field: string,
	) => {
		const hashedPassword = await hashPassword(options.app, password, field);

		const patchToUser = Object.assign({}, verifyChanges || {}, {
			isVerified,
			verifyToken: null,
			verifyShortToken: null,
			verifyExpires: null,
			verifyChanges: {},
			password: hashedPassword,
		});

		const result = await usersService.patch(
			user[usersServiceIdName],
			patchToUser,
			{},
		);
		return result;
	};

	if (!Object.keys(tokens).every((key) => tokens[key] === user1[key])) {
		await eraseVerifyPropsSetPassword(
			user1,
			user1.isVerified,
			{},
			password,
			field,
		);

		throw new errors.BadRequest(
			'Invalid token. Get for a new one. (authLocalMgnt)',
			{ errors: { $className: 'badParam' } },
		);
	}

	const user2 = await eraseVerifyPropsSetPassword(
		user1,
		user1.verifyExpires > Date.now(),
		user1.verifyChanges || {},
		password,
		field,
	);

	const user3 = await notifier(
		options.notifier,
		'verifySignupSetPassword',
		user2,
	);

	return options.sanitizeUserForClient(user3);
}
