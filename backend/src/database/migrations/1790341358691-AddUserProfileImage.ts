import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileImage1790341358691 implements MigrationInterface {
    name = 'AddUserProfileImage1790341358691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profile_image" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    }

}
