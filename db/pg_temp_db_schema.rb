# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_09_14_101736) do

  create_table "pg_raw_books", id: false, force: :cascade do |t|
    t.integer "pg_book_id"
    t.text "rdf_content"
    t.text "dir_files_sizes"
    t.integer "has_intro", limit: 1
    t.text "intro"
    t.integer "has_cover", limit: 1
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["pg_book_id"], name: "index_pg_raw_books_on_pg_book_id", unique: true
  end

end
