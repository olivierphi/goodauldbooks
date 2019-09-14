class CreatePgRawBooks < ActiveRecord::Migration[6.0]
  def change
    create_table :pg_raw_books, id: false, primary_key: :pg_book_id  do |t|
      t.integer :pg_book_id, auto_increment: false
      t.text :rdf_content
      t.text :dir_files_sizes
      t.integer :has_intro, limit: 1
      t.text :intro
      t.integer :has_cover, limit: 1

      t.timestamps
    end
    add_index :pg_raw_books, :pg_book_id, unique: true
  end
end
