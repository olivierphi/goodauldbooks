import {MigrationInterface, QueryRunner} from "typeorm";

export class InitModel1523894650491 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "book" ("id" SERIAL NOT NULL, "title" character varying(255) COLLATE "C.UTF-8" NOT NULL, "slug" character varying(255) COLLATE "C.UTF-8" NOT NULL, "lang" character varying(2) NOT NULL, "fulltext_content" text NOT NULL, "genres" text array NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uk_book_title" UNIQUE ("title") , CONSTRAINT "uk_book_slug" UNIQUE ("slug"), PRIMARY KEY("id"))`);
        await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "first_name" character varying(255) COLLATE "C.UTF-8" NOT NULL, "last_name" character varying(255) COLLATE "C.UTF-8" NOT NULL, "birth_year" integer NOT NULL, "death_year" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), PRIMARY KEY("id"))`);
        await queryRunner.query(`CREATE TABLE "author_books" ("author" integer NOT NULL, "book" integer NOT NULL, PRIMARY KEY("author", "book"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "ind_2c813d55f51a3d0e1573613a34" ON "book"("slug")`);
        await queryRunner.query(`ALTER TABLE "author_books" ADD CONSTRAINT "fk_7f94cd1949ccace12975feb461e" FOREIGN KEY ("author") REFERENCES "author"("id")`);
        await queryRunner.query(`ALTER TABLE "author_books" ADD CONSTRAINT "fk_575cfd71244ba77037d9578a03b" FOREIGN KEY ("book") REFERENCES "book"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "author_books" DROP CONSTRAINT "fk_575cfd71244ba77037d9578a03b"`);
        await queryRunner.query(`ALTER TABLE "author_books" DROP CONSTRAINT "fk_7f94cd1949ccace12975feb461e"`);
        await queryRunner.query(`-- TODO: revert CREATE UNIQUE INDEX "ind_2c813d55f51a3d0e1573613a34" ON "book"("slug")`);
        await queryRunner.query(`DROP TABLE "author_books"`);
        await queryRunner.query(`DROP TABLE "author"`);
        await queryRunner.query(`DROP TABLE "book"`);
    }

}
