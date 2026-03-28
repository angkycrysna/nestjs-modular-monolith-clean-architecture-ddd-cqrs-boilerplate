// ── Uncomment after: pnpm add @confluentinc/kafka-javascript ──
// import * as CKafka from '@confluentinc/kafka-javascript';
// const { Kafka } = CKafka.KafkaJS;
// type KafkaProducer = ReturnType<InstanceType<typeof Kafka>['producer']>;
// type KafkaConsumer = ReturnType<InstanceType<typeof Kafka>['consumer']>;

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMessageBroker } from '@shared/application/interfaces/message-broker.interface';

/**
 * Kafka message broker — implementation using Confluent's
 * official JavaScript client (backed by librdkafka).
 *
 * To activate:
 *   1. pnpm add @confluentinc/kafka-javascript
 *   2. Uncomment the imports at the top of this file.
 *   3. Uncomment the code blocks below.
 *   4. Add env vars:
 *        KAFKA_BROKERS=broker1:9092,broker2:9092
 *        KAFKA_CLIENT_ID=my-app
 *        KAFKA_GROUP_ID=my-app-group
 *        KAFKA_SASL_USERNAME=  (optional, for SASL auth)
 *        KAFKA_SASL_PASSWORD=  (optional, for SASL auth)
 *   5. Swap DI in messaging.module.ts:
 *        { provide: MESSAGE_BROKER, useClass: KafkaMessageBroker }
 */
@Injectable()
export class KafkaMessageBroker
  implements IMessageBroker, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaMessageBroker.name);
  // private producer!: KafkaProducer;
  // private consumer!: KafkaConsumer;
  constructor(private readonly config: ConfigService) {}

  onModuleInit(): Promise<void> {
    // const brokers = this.config
    //   .get<string>('KAFKA_BROKERS', 'localhost:9092')
    //   .split(',')
    //   .map((b) => b.trim());
    // const clientId = this.config.get<string>('KAFKA_CLIENT_ID', 'nestjs-app');
    // const groupId = this.config.get<string>('KAFKA_GROUP_ID', 'nestjs-app-group');
    // const username = this.config.get<string>('KAFKA_SASL_USERNAME');
    // const password = this.config.get<string>('KAFKA_SASL_PASSWORD');
    //
    // const kafka = new Kafka({
    //   kafkaJS: {
    //     brokers,
    //     clientId,
    //     ssl: !!username,
    //     ...(username && password
    //       ? { sasl: { mechanism: 'plain', username, password } }
    //       : {}),
    //   },
    // });
    //
    // this.producer = kafka.producer({
    // kafkaJS: { acks: -1 }, // Wait for all ISR replicas
    // });
    // this.consumer = kafka.consumer({
    //   kafkaJS: { groupId, fromBeginning: false },
    // });
    //
    // await this.producer.connect();
    // this.logger.log('Kafka producer connected');

    this.logger.warn(
      'KafkaMessageBroker: @confluentinc/kafka-javascript not installed. ' +
        'Run: pnpm add @confluentinc/kafka-javascript',
    );
    void this.config;
    return Promise.resolve();
  }

  publish(topic: string, message: string): Promise<void> {
    // await this.producer.send({
    //   topic,
    //   messages: [{ value: message }],
    // });
    // this.logger.debug(`Published to Kafka topic "${topic}"`);

    this.logger.warn(`[Kafka] Not active — would publish to "${topic}"`);
    void message;
    return Promise.resolve();
  }

  subscribe(
    topic: string,
    handler: (message: string) => Promise<void>,
  ): Promise<void> {
    // await this.consumer.connect();
    // await this.consumer.subscribe({ topic });
    //
    // await this.consumer.run({
    //   eachMessage: async ({ message: kafkaMessage }) => {
    //     const value = kafkaMessage.value?.toString();
    //     if (!value) return;
    //
    //     try {
    //       await handler(value);
    //     } catch (error) {
    //       this.logger.error(
    //         `Error processing message from "${topic}"`,
    //         error instanceof Error ? error.stack : String(error),
    //       );
    //     }
    //   },
    // });
    // this.logger.log(`Subscribed to Kafka topic "${topic}"`);

    this.logger.warn(`[Kafka] Not active — would subscribe to "${topic}"`);
    void handler;
    return Promise.resolve();
  }

  onModuleDestroy(): Promise<void> {
    // await this.producer?.disconnect();
    // await this.consumer?.disconnect();
    // this.logger.log('Kafka connections closed');
    return Promise.resolve();
  }
}
