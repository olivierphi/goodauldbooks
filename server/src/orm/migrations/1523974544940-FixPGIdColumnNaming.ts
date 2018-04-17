import {MigrationInterface, QueryRunner} from "typeorm";

export class FixPGIdColumnNaming1523974544940 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "projetGutenbergId"`);
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "projetGutenbergId"`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "project_gutenber_id" integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "project_gutenber_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "project_gutenber_id"`);
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "project_gutenber_id"`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "projetGutenbergId" integer(32)`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "projetGutenbergId" integer(32)`);
    }

}
