/** Injection token for the message broker. */
export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');

/**
 * Message broker port — abstracts the external messaging system.
 *
 * The outbox processor uses this to dispatch integration events to
 * the configured message broker. Swap implementations to change brokers
 * without touching any business logic.
 *
 * Implementations:
 * - `NoopMessageBroker` — Default for monolith mode (logs only, no external broker).
 * - Future: `KafkaMessageBroker`, `RabbitMqMessageBroker`, `NsqMessageBroker`.
 *
 * @example
 * ```typescript
 * // To swap broker, change ONE DI binding in messaging.module.ts:
 * { provide: MESSAGE_BROKER, useClass: KafkaMessageBroker }
 * ```
 */
export interface IMessageBroker {
  /**
   * Publish a message to a topic/queue.
   *
   * @param topic - The topic or queue name (e.g., 'user.registered').
   * @param message - The serialized event payload.
   */
  publish(topic: string, message: string): Promise<void>;

  /**
   * Subscribe to a topic/queue and process incoming messages.
   *
   * @param topic - The topic or queue name to subscribe to.
   * @param handler - Callback invoked for each received message.
   */
  subscribe(
    topic: string,
    handler: (message: string) => Promise<void>,
  ): Promise<void>;
}
