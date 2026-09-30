import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogs1790167651184 implements MigrationInterface {
    name = 'CreateAuditLogs1790167651184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET', 'ACCOUNT_ACTIVATED', 'ACCOUNT_DEACTIVATED', 'ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'ORDER_CANCELLED', 'MENU_ITEM_CREATED', 'MENU_ITEM_UPDATED', 'MENU_ITEM_DELETED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED', 'UNAUTHORIZED_ACCESS')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "user_id" integer, "action" "public"."audit_logs_action_enum" NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" integer, "description" text NOT NULL, "ip_address" character varying(100), "user_agent" text, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    }

}
