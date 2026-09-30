import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSecurityAuditActions1790205519625 implements MigrationInterface {
    name = 'AddSecurityAuditActions1790205519625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE 'PASSWORD_CHANGE_FAILED'`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE 'SUSPICIOUS_ACTIVITY'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum_old" AS ENUM('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET', 'ACCOUNT_ACTIVATED', 'ACCOUNT_DEACTIVATED', 'ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'ORDER_CANCELLED', 'MENU_ITEM_CREATED', 'MENU_ITEM_UPDATED', 'MENU_ITEM_DELETED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED', 'UNAUTHORIZED_ACCESS', 'SESSION_REVOKED')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum_old" USING "action"::"text"::"public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum_old" RENAME TO "audit_logs_action_enum"`);
    }

}
