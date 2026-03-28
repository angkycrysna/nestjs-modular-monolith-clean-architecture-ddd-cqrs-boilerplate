// ── Uncomment after: pnpm add amqplib && pnpm add -D @types/amqplib ──
// import amqplib, { type Connection, type Channel } from 'amqplib';

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMessageBroker } from '@shared/application/interfaces/message-broker.interface';

/**
 * RabbitMQ message broker — implementation using amqplib.
 *
 * Uses topic exchanges for flexible routing. Each integration event name
 * (e.g., 'user.registered') becomes a routing key, allowing consumers
 * to subscribe with wildcards (e.g., 'user.*' for all user events).
 *
 * To activate:
 *   1. pnpm add amqplib && pnpm add -D @types/amqplib
 *   2. Uncomment the import at the top of this file.
 *   3. Uncomment the code blocks below.
 *   4. Add env vars:
 *        RABBITMQ_URL=amqp://user:password@localhost:5672
 *        RABBITMQ_EXCHANGE=app.events  (optional, defaults to 'app.events')
 *   5. Swap DI in messaging.module.ts:
 *        { provide: MESSAGE_BROKER, useClass: RabbitMqMessageBroker }
 */
@Injectable()
export class RabbitMqMessageBroker
  implements IMessageBroker, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqMessageBroker.name);
  // private connection!: Connection;
  // private channel!: Channel;
  // private exchange!: string;
  constructor(private readonly config: ConfigService) {}

  onModuleInit(): Promise<void> {
    // const url = this.config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
    // this.exchange = this.config.get<string>('RABBITMQ_EXCHANGE', 'app.events');
    //
    // this.connection = await amqplib.connect(url);
    // this.channel = await this.connection.createChannel();
    //
    // // Prefetch 1 message at a time per consumer for fair dispatch
    // await this.channel.prefetch(1);
    //
    // // Declare a durable topic exchange — survives broker restarts
    // await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    //
    // this.connection.on('error', (err) => {
    //   this.logger.error('RabbitMQ connection error', err);
    // });
    // this.connection.on('close', () => {
    //   this.logger.warn('RabbitMQ connection closed');
    // });
    //
    // this.logger.log(`RabbitMQ connected (exchange: ${this.exchange})`);

    this.logger.warn(
      'RabbitMqMessageBroker: amqplib not installed. ' +
        'Run: pnpm add amqplib && pnpm add -D @types/amqplib',
    );
    void this.config;
    return Promise.resolve();
  }

  publish(topic: string, message: string): Promise<void> {
    // this.channel.publish(
    //   this.exchange,
    //   topic, // routing key = event name (e.g., 'user.registered')
    //   Buffer.from(message),
    //   {
    //     persistent: true, // message survives broker restart
    //     contentType: 'application/json',
    //     timestamp: Date.now(),
    //   },
    // );
    // this.logger.debug(`Published to RabbitMQ "${this.exchange}" with key "${topic}"`);

    this.logger.warn(`[RabbitMQ] Not active — would publish to "${topic}"`);
    void message;
    return Promise.resolve();
  }

  subscribe(
    topic: string,
    handler: (message: string) => Promise<void>,
  ): Promise<void> {
    // // Durable queue named after the topic — survives broker restarts
    // const queueName = `q.${topic}`;
    // await this.channel.assertQueue(queueName, { durable: true });
    //
    // // Bind queue to exchange with the event name as routing key
    // await this.channel.bindQueue(queueName, this.exchange, topic);
    //
    // await this.channel.consume(queueName, async (msg) => {
    //   if (!msg) return;
    //
    //   try {
    //     await handler(msg.content.toString());
    //     this.channel.ack(msg); // Acknowledge after successful processing
    //   } catch (error) {
    //     this.logger.error(
    //       `Error processing message from "${topic}"`,
    //       error instanceof Error ? error.stack : String(error),
    //     );
    //     // Requeue on failure — message goes back for retry.
    //     // For dead-letter queue support, configure DLX on the queue instead.
    //     this.channel.nack(msg, false, true);
    //   }
    // });
    // this.logger.log(`Subscribed to RabbitMQ queue "${queueName}" (key: "${topic}")`);

    this.logger.warn(`[RabbitMQ] Not active — would subscribe to "${topic}"`);
    void handler;
    return Promise.resolve();
  }

  onModuleDestroy(): Promise<void> {
    // await this.channel?.close();
    // await this.connection?.close();
    // this.logger.log('RabbitMQ connections closed');
    return Promise.resolve();
  }
}
