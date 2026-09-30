import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateCarts1790198535426
  implements MigrationInterface
{
  name = 'CreateCarts1790198535426';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" SERIAL NOT NULL,
        "cart_id" integer NOT NULL,
        "menu_item_id" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT '1',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b"
        PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_2ec1c94a977b940d85a4f498aea"
        UNIQUE ("user_id"),
        CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816"
        PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623"
      FOREIGN KEY ("cart_id")
      REFERENCES "carts"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "FK_13e501a1cd1a6b1433ded345689"
      FOREIGN KEY ("menu_item_id")
      REFERENCES "menu_items"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cart_items"
      DROP CONSTRAINT "FK_13e501a1cd1a6b1433ded345689"
    `);

    await queryRunner.query(`
      ALTER TABLE "cart_items"
      DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"
    `);

    await queryRunner.query(`
      DROP TABLE "carts"
    `);

    await queryRunner.query(`
      DROP TABLE "cart_items"
    `);
  }
}