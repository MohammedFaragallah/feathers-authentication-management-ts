import errors from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import { getLongToken, getShortToken, ensureFieldHasChanged } from '../helpers';
import { HookContext } from '@feathersjs/feathers';

export const addVerification = (path?: string) => async (
	context: HookContext,
) => {
	checkContext(context, 'before', ['create', 'patch', 'update']);

	return Promise.resolve()
		.then(() =>
			context.app
				.service(path || 'authManagement')
				.create({ action: 'options' }),
		)
		.then((options) =>
			Promise.all([
				options,
				getLongToken(options.longTokenLen),
				getShortToken(options.shortTokenLen, options.shortTokenDigits),
			]),
		)
		.then(([options, longToken, shortToken]) => {
			// We do NOT add verification fields if the 3 following conditions are fulfilled:
			// - hook is PATCH or PUT
			// - user is authenticated
			// - user's identifyUserProps fields did not change
			if (
				(context.method === 'patch' || context.method === 'update') &&
				!!context.params.user &&
				!options.identifyUserProps.some(
					ensureFieldHasChanged(context.data, context.params.user),
				)
			) {
				return context;
			}

			context.data.isVerified = false;
			context.data.verifyExpires = Date.now() + options.delay;
			context.data.verifyToken = longToken;
			context.data.verifyShortToken = shortToken;
			context.data.verifyChanges = {};

			return context;
		})
		.catch((err) => {
			throw new errors.GeneralError(err);
		});
};
