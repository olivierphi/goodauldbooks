import {MigrationInterface, QueryRunner} from "typeorm";

export class FixPGTypo1523974449016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "projetGutenberId"`);
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "projetGutenberId"`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "projetGutenbergId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "projetGutenbergId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "projetGutenbergId"`);
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "projetGutenbergId"`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "projetGutenberId" integer(32)`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "projetGutenberId" integer(32)`);
    }

}
