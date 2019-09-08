class ProjectGutenberg::Import::GeneratedCollectionImporter
    @@debug = true
    @@books_loop_limit = 20

    def import(pg_collection_path)
        loop_over_books_with_epub_version pg_collection_path do |rdf_path: , book_id:|
            puts "Let's handle book #{book_id}" if debug?
        end
    end

    private

    def loop_over_books_with_epub_version(pg_collection_path, &block)
        counter = 0
        Dir.glob("*/*.rdf", base: pg_collection_path) do |rdf_path|
            counter = counter + 1
            break if counter >= books_loop_limit
            break if counter >= 30

            book_id_match = rdf_path.match(%r{\d+/pg(?<pg_id>\d+).rdf})
            if book_id_match.nil?
                puts "Can't extract Gutenberg id from RDF path #{rdf_path}"  if debug?
                next
            end

            book_id = book_id_match[:pg_id].to_i
            book_dir = File.dirname(File.join(pg_collection_path, rdf_path))
            epub_path = File.join(book_dir, "pg#{book_id}.epub")
            unless File.exists? epub_path
                puts "No EPUB file '#{epub_path}' for book #{book_id}"  if debug?
                next
            end

            block.call(rdf_path: rdf_path, book_id: book_id)
        end
    end

    def debug?
        !!@@debug
    end

    def books_loop_limit
        @@books_loop_limit ||= Infinity
    end

end
