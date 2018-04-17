import {MigrationInterface, QueryRunner} from "typeorm";

export class LangCodesCanHave3Chars1523973855255 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "lang" TYPE character varying(3)`);
        await queryRunner.query(`ALTER TABLE "public"."author" ALTER COLUMN "projetGutenberId" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD CONSTRAINT "uk_author_projetGutenberId" UNIQUE ("projetGutenberId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ADD CONSTRAINT "uk_author_projetGutenberId" UNIQUE ("projetGutenberId")`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ALTER COLUMN "projetGutenberId" TYPE integer`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ALTER COLUMN "lang" TYPE character varying(3)`);
    }

}
