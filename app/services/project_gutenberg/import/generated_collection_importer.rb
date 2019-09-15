require 'json'

require "library_import/structs"

module ProjectGutenberg
    module Import 
        class GeneratedCollectionImporter
            BOOK_ASSETS = {
                epub: "pg%<pg_book_id>d.epub",
                mobi: "pg%<pg_book_id>d.mobi",
                cover: "pg%<pg_book_id>d.cover.medium.jpg",
                text: "pg%<pg_book_id>d.txt.utf8",
            }
            BOOK_INTRO_SIZE = 50 # we'll store the first N characters of the UTF8 text file
            BOOKS_LOOP_LIMIT = 30 # set to 0 or Infinity to disable that limit

            DEBUG = true

            def import(pg_collection_path, wipe_previous_data: false)
                truncate_existing_import() if wipe_previous_data

                loop_over_books_with_epub_version pg_collection_path do |book_dir:, rdf_path: , book_id:|
                    rdf_content = File.read(rdf_path).force_encoding(Encoding::UTF_8)
                    assets_size = get_book_assets_sizes(book_dir, book_id)
                    book_has_cover = !assets_size[:cover].nil?
                    book_has_intro = !assets_size[:text].nil?
                    book_intro =  book_has_intro ? get_book_intro(book_dir, book_id) : nil 
                    puts [:book_id, assets_size, book_has_cover, book_has_intro, book_intro, "======"] if debug?

                    PgRawBook.create!(
                        pg_book_id: book_id,
                        rdf_content: rdf_content,
                        dir_files_sizes: JSON.generate(assets_size),
                        has_intro: book_has_intro,
                        intro: book_intro,
                        has_cover: book_has_cover,
                    )
                end
            end

            private

            def truncate_existing_import
                PgRawBook.delete_all()
            end

            def loop_over_books_with_epub_version(pg_collection_path, &block)
                counter = 0
                Dir.glob("*/*.rdf", base: pg_collection_path) do |rdf_path|
                    counter = counter + 1
                    break if counter >= BOOKS_LOOP_LIMIT
                    break if counter >= 100 # additional security while we're still in "WIP" phase :-)

                    book_id = book_id_from_rdf_path(rdf_path)
                    if book_id.nil?
                        puts "Can't extract Gutenberg id from RDF path #{rdf_path}"  if debug?
                        next
                    end

                    rdf_full_path = File.join(pg_collection_path, rdf_path)
                    book_dir = File.dirname(rdf_full_path)
                    epub_path = File.join(book_dir, "pg#{book_id}.epub")
                    unless File.exists? epub_path
                        puts "No EPUB file '#{epub_path}' for book #{book_id}"  if debug?
                        next
                    end

                    block.call(book_dir: book_dir, rdf_path: rdf_full_path, book_id: book_id)
                end
            end

            def book_id_from_rdf_path(rdf_path)
                book_id_match = rdf_path.match(%r~^\d+/pg(?<pg_id>\d+).rdf$~)
                return nil if book_id_match.nil?
                return book_id_match[:pg_id]
            end

            def get_book_assets_sizes(book_dir, book_id)
                assets_sizes = {}
                BOOK_ASSETS.each do |asset_type, file_name_pattern|
                    file_name = sprintf(file_name_pattern, {pg_book_id: book_id})
                    file_path = File.join(book_dir, file_name)
                    if File.exists?(file_path)
                        assets_sizes[asset_type] = File.size(file_path)
                    end
                end
                assets_sizes
            end

            def get_book_intro(book_dir, book_id)
                book_text_file_name = sprintf(BOOK_ASSETS[:text], {pg_book_id: book_id})
                book_text_file_path = File.join(book_dir, book_text_file_name)

                File.read(book_text_file_path, BOOK_INTRO_SIZE, mode: "rb").force_encoding(Encoding::UTF_8)
            end

            def debug?
                !!DEBUG
            end

        end
    end
end
