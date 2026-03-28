/**
 * Type-safe activity action and target table builders.
 *
 * These helpers enforce naming conventions at compile time so you
 * get autocomplete and TypeScript errors instead of runtime typos.
 *
 * Action format: `<module>.<resource>.<verb>`
 *   - module: singular (e.g., 'user', 'order', 'payment')
 *   - resource: snake_case (e.g., 'profile', 'work_address', 'order_item')
 *   - verb: past tense (e.g., 'created', 'updated', 'deleted', 'added')
 *
 * Target table format: snake_case (e.g., 'users', 'user_profiles')
 */

// ─── Action type ──────────────────────────────────────────────────────
/**
 * Branded type for activity actions.
 * Enforces the `module.resource.verb` dot-notation format at the type level.
 */
export type ActivityAction = `${string}.${string}.${string}`;

// ─── defineModuleActions ──────────────────────────────────────────────
/**
 * Builds a typed, frozen map of activity action strings for a module.
 *
 * Returns a nested object where `actions.resource.verb` resolves to
 * the full `'module.resource.verb'` string. TypeScript enforces that
 * only defined resource+verb combinations are used — typos cause
 * compile errors.
 *
 * @param moduleName - Module prefix (singular, e.g., 'user', 'order').
 * @param resources  - Map of resource names to arrays of past-tense verbs.
 * @returns A frozen nested object of typed action strings.
 *
 * @example
 * ```typescript
 * export const USER_ACTIONS = defineModuleActions('user', {
 *   profile: ['created', 'updated', 'deleted'],
 *   family_member: ['added', 'removed', 'updated'],
 *   avatar: ['uploaded', 'removed'],
 * } as const);
 *
 * // Usage — fully typed, autocomplete works:
 * USER_ACTIONS.profile.created      // → 'user.profile.created'
 * USER_ACTIONS.family_member.added  // → 'user.family_member.added'
 *
 * // Typos → TypeScript compile error:
 * USER_ACTIONS.profile.craeted      // ❌ Property 'craeted' does not exist
 * USER_ACTIONS.proflie.created      // ❌ Property 'proflie' does not exist
 * ```
 */
export function defineModuleActions<
  TModule extends string,
  TResources extends Readonly<Record<string, readonly string[]>>,
>(
  moduleName: TModule,
  resources: TResources,
): Readonly<{
  [R in keyof TResources & string]: Readonly<{
    [V in TResources[R][number] & string]: `${TModule}.${R}.${V}`;
  }>;
}> {
  const result: Record<string, Record<string, string>> = {};

  for (const [resource, verbs] of Object.entries(resources)) {
    const verbMap: Record<string, string> = {};
    for (const verb of verbs) {
      verbMap[verb] = `${moduleName}.${resource}.${verb}`;
    }
    result[resource] = Object.freeze(verbMap);
  }

  return Object.freeze(result) as ReturnType<
    typeof defineModuleActions<TModule, TResources>
  >;
}

// ─── defineModuleTargets ──────────────────────────────────────────────
/**
 * Builds a typed, frozen map of target table names for a module.
 *
 * It can be selected from the typed map instead of writing raw strings.
 * Table names must be snake_case — enforced by convention and code review.
 *
 * @param targets - Map of logical names to actual table names (snake_case).
 * @returns A frozen object of typed table name strings.
 *
 * @example
 * ```typescript
 * export const USER_TARGETS = defineModuleTargets({
 *   users: 'users',
 *   user_profiles: 'user_profiles',
 *   user_settings: 'user_settings',
 * } as const);
 *
 * // Usage — fully typed, autocomplete works:
 * USER_TARGETS.users           // → 'users'
 * USER_TARGETS.user_profiles   // → 'user_profiles'
 *
 * // Typos → TypeScript compile error:
 * USER_TARGETS.user_profils    // ❌ Property 'user_profils' does not exist
 * ```
 */
export function defineModuleTargets<
  TTargets extends Readonly<Record<string, string>>,
>(targets: TTargets): Readonly<TTargets> {
  return Object.freeze({ ...targets });
}
