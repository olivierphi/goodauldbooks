import {MigrationInterface, QueryRunner} from "typeorm";

export class FixPGColumnTypoAgain1523974728557 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "project_gutenber_id"`);
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "project_gutenber_id"`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "project_gutenberg_id" integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "project_gutenberg_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author" DROP "project_gutenberg_id"`);
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "project_gutenberg_id"`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD "project_gutenber_id" integer(32)`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "project_gutenber_id" integer(32)`);
    }

}
