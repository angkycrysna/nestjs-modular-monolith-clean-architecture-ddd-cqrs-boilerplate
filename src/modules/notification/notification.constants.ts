import {
  defineModuleActions,
  defineModuleTargets,
} from '@shared/application/activity/define-module-actions';

/**
 * Database schema for the Notification module.
 * To migrate to microservice: change to 'public'.
 */
export const NOTIFICATION_DB_SCHEMA = 'notifications';

// Injection tokens
export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

// Activity log actions
export const NOTIFICATION_ACTIONS = defineModuleActions('notification', {
  welcome: ['sent'],
} as const);

// Activity log target tables
export const NOTIFICATION_TARGETS = defineModuleTargets({
  notifications: 'notifications',
} as const);
