import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoriesTable1745991902778 implements MigrationInterface {
  name = 'AddCategoriesTable1745991902778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13e8b2a21988bec6fdcbb1fa74" ON "categories" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" SERIAL NOT NULL, "content" text NOT NULL, "taskId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63ce9e2673b974d66f5dcd7221" ON "notes" ("taskId") `,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "categoryId" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_45c335aa59992cd2a5fc52f343" ON "tasks" ("categoryId") WHERE "categoryId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_8ae9301033f772a42330e917a7d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_63ce9e2673b974d66f5dcd72211" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_63ce9e2673b974d66f5dcd72211"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_8ae9301033f772a42330e917a7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45c335aa59992cd2a5fc52f343"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "categoryId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63ce9e2673b974d66f5dcd7221"`,
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_13e8b2a21988bec6fdcbb1fa74"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
