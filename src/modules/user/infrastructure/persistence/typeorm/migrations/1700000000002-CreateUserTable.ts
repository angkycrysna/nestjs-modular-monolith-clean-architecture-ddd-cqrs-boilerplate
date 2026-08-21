import { MigrationInterface, QueryRunner } from 'typeorm';
import { USER_DB_SCHEMA } from '@user/user.constants';

export class CreateUserTable1700000000002 implements MigrationInterface {
  name = 'CreateUserTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${USER_DB_SCHEMA}"`);

    await queryRunner.query(`
      CREATE TABLE "${USER_DB_SCHEMA}"."users" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "${USER_DB_SCHEMA}"."users"`);
    await queryRunner.query(
      `DROP SCHEMA IF EXISTS "${USER_DB_SCHEMA}" CASCADE`,
    );
  }
}
