import {
  defineModuleActions,
  defineModuleTargets,
} from '@shared/application/activity/define-module-actions';

/**
 * Database schema for the User module.
 * All TypeORM entities in this module use this schema.
 * To migrate to microservice: change to 'public'.
 */
export const USER_DB_SCHEMA = 'users';

// Injection tokens
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Activity log actions (type-safe, compile-time enforced)
export const USER_ACTIONS = defineModuleActions('user', {
  profile: ['created', 'updated', 'deleted'],
} as const);

// Activity log target tables (type-safe)
export const USER_TARGETS = defineModuleTargets({
  users: 'users',
} as const);
