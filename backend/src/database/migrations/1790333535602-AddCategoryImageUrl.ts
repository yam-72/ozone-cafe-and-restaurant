import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryImageUrl1790333535602 implements MigrationInterface {
    name = 'AddCategoryImageUrl1790333535602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "imageUrl" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "imageUrl"`);
    }

}
