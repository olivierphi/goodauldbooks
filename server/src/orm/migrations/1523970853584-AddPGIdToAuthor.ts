import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPGIdToAuthor1523970853584 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "projetGutenberId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "projetGutenberId" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD CONSTRAINT "uk_book_projetGutenberId" UNIQUE ("projetGutenberId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ADD CONSTRAINT "uk_book_projetGutenberId" UNIQUE ("projetGutenberId")`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ALTER COLUMN "projetGutenberId" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "projetGutenberId"`);
    }

}
