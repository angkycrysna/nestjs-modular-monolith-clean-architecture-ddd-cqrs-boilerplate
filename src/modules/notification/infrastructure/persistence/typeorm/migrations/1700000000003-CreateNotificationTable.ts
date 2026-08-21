import { MigrationInterface, QueryRunner } from 'typeorm';
import { NOTIFICATION_DB_SCHEMA } from '@notification/notification.constants';

export class CreateNotificationTable1700000000003 implements MigrationInterface {
  name = 'CreateNotificationTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SCHEMA IF NOT EXISTS "${NOTIFICATION_DB_SCHEMA}"`,
    );

    await queryRunner.query(`
      CREATE TABLE "${NOTIFICATION_DB_SCHEMA}"."notifications" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "user_name" character varying NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_id"
      ON "${NOTIFICATION_DB_SCHEMA}"."notifications" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "${NOTIFICATION_DB_SCHEMA}"."notifications"`,
    );
    await queryRunner.query(
      `DROP SCHEMA IF EXISTS "${NOTIFICATION_DB_SCHEMA}" CASCADE`,
    );
  }
}
