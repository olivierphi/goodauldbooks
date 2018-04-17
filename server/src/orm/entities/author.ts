import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { utf8 } from "./_utf8_collation";
import { Book } from "./book";

@Entity()
export class Author {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, name: "first_name", ...utf8 })
  public firstName!: string;

  @Column({ type: "varchar", length: 255, nullable: false, name: "last_name", ...utf8 })
  public lastName!: string;

  @Column({ type: "integer", nullable: true, unique: true, name: "project_gutenberg_id" })
  public projetGutenbergId!: number | null;

  @Column({ type: "integer", nullable: true, name: "birth_year" })
  public birthYear!: number | null;

  @Column({ type: "integer", nullable: true, name: "death_year" })
  public deathYear!: number | null;

  @ManyToMany(type => Book, book => book.authors)
  @JoinTable({
    name: "author_books",
    joinColumn: {
      name: "author",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "book",
      referencedColumnName: "id",
    },
  })
  public books!: Book[];

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
}
