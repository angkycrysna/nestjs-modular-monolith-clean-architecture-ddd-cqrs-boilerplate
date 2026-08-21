import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSharedTables1700000000001 implements MigrationInterface {
  name = 'CreateSharedTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "outbox_events_status_enum"
      AS ENUM('pending', 'processing', 'published', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE "outbox_events" (
        "id" uuid NOT NULL,
        "event_name" character varying NOT NULL,
        "payload" jsonb NOT NULL,
        "occurred_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "status" "outbox_events_status_enum" NOT NULL DEFAULT 'pending',
        "published_at" TIMESTAMP WITH TIME ZONE,
        "retry_count" integer NOT NULL DEFAULT 0,
        "max_retries" integer NOT NULL DEFAULT 5,
        "last_error" text,
        "metadata" jsonb,
        CONSTRAINT "PK_outbox_events" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_outbox_events_event_name" ON "outbox_events" ("event_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_outbox_events_status" ON "outbox_events" ("status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "actor_id" uuid,
        "actor_name" character varying NOT NULL,
        "module" character varying NOT NULL,
        "note" text NOT NULL,
        "target_id" character varying,
        "target_table" character varying,
        "old_data" jsonb,
        "new_data" jsonb,
        "correlation_id" character varying NOT NULL,
        "ip_address" character varying,
        "user_agent" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_action" ON "activity_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_actor_id" ON "activity_logs" ("actor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_module" ON "activity_logs" ("module")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_target_id" ON "activity_logs" ("target_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_target_table" ON "activity_logs" ("target_table")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_correlation_id" ON "activity_logs" ("correlation_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TABLE "outbox_events"`);
    await queryRunner.query(`DROP TYPE "outbox_events_status_enum"`);
  }
}
