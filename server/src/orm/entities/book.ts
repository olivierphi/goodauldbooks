import {
  Column,
  ColumnOptions,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Lang } from "../../domain/import";
import { utf8 } from "./_utf8_collation";
import { Author } from "./author";

/**
 * TODO: add a many-to-one from Book to Books, named "isTranslationOf".
 */

@Entity()
export class Book {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 500, nullable: false, unique: true, ...utf8 })
  public title!: string;

  @Column({ type: "integer", nullable: true, unique: true, name: "project_gutenberg_id" })
  public projetGutenbergId!: number | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, nullable: false, unique: true, ...utf8 })
  public slug!: string;

  @ManyToMany(type => Author, author => author.books)
  public authors!: Author[];

  @Column({ type: "varchar", length: 3, nullable: false })
  public lang!: Lang;

  // @Column({ type: "tsvector", nullable: false })
  @Column({ type: "text", nullable: false, name: "fulltext_content" })
  public fullTextContent!: string;

  @Column({ type: "text", nullable: false, array: true })
  public genres!: string[];

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
}
