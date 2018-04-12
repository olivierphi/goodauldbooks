import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { utf8 } from "./_utf8_collation";
import { Author } from "./author";

@Entity()
export class Book {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true, ...utf8 })
  public title!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, nullable: false, unique: true, ...utf8 })
  public slug!: string;

  @ManyToMany(type => Author, author => author.books)
  public authors!: Author[];
}
