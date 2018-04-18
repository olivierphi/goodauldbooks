import {MigrationInterface, QueryRunner} from "typeorm";

export class FixAuthorBooksJoinTableColumnsNames1524040219212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP CONSTRAINT "fk_7f94cd1949ccace12975feb461e"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP CONSTRAINT "fk_575cfd71244ba77037d9578a03b"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP "author"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP "book"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD "author_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD "book_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "project_gutenberg_id" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."book" ADD CONSTRAINT "uk_book_project_gutenberg_id" UNIQUE ("project_gutenberg_id")`);
        await queryRunner.query(`ALTER TABLE "public"."author" ALTER COLUMN "project_gutenberg_id" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ADD CONSTRAINT "uk_author_project_gutenberg_id" UNIQUE ("project_gutenberg_id")`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP CONSTRAINT IF EXISTS "author_books_pkey"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "author_books_pkey"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD PRIMARY KEY ("author_id", "book_id")`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD CONSTRAINT "fk_eda8d2fc1b091edeafa7a958802" FOREIGN KEY ("author_id") REFERENCES "author"("id")`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD CONSTRAINT "fk_2e6775ad15e7ead33efef6dfff4" FOREIGN KEY ("book_id") REFERENCES "book"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP CONSTRAINT "fk_2e6775ad15e7ead33efef6dfff4"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP CONSTRAINT "fk_eda8d2fc1b091edeafa7a958802"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP PRIMARY KEY ("author_id", "book_id")`);
        await queryRunner.query(`-- TODO: revert DROP INDEX IF EXISTS "author_books_pkey"`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author_books" DROP CONSTRAINT IF EXISTS "author_books_pkey"`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ADD CONSTRAINT "uk_author_project_gutenberg_id" UNIQUE ("project_gutenberg_id")`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ALTER COLUMN "project_gutenberg_id" TYPE integer`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ADD CONSTRAINT "uk_book_project_gutenberg_id" UNIQUE ("project_gutenberg_id")`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ALTER COLUMN "project_gutenberg_id" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP "book_id"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" DROP "author_id"`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD "book" integer(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD "author" integer(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD CONSTRAINT "fk_575cfd71244ba77037d9578a03b" FOREIGN KEY ("") REFERENCES ""("")`);
        await queryRunner.query(`ALTER TABLE "public"."author_books" ADD CONSTRAINT "fk_7f94cd1949ccace12975feb461e" FOREIGN KEY ("") REFERENCES ""("")`);
    }

}
