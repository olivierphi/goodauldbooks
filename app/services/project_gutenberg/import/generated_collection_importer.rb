require "library_import/structs"

class ProjectGutenberg::Import::GeneratedCollectionImporter
    LIBRARY_ITEMS_ID_PREFIX = "pg."

    @@debug = true
    @@books_loop_limit = 10

    def import(pg_collection_path)
        loop_over_books_with_epub_version pg_collection_path do |rdf_path: , book_id:|
            # the following line is a quick-n-dirty test, we'll do proper parsing and storage
            # in the next phase :-)
            PgRawBook.create!(pg_book_id: book_id, rdf_content: File.read(rdf_path))
            
            raw_book_data = parse_rdf(rdf_path: rdf_path, book_id: book_id)
            puts raw_book_data
        end
    end

    private

    def loop_over_books_with_epub_version(pg_collection_path, &block)
        counter = 0
        Dir.glob("*/*.rdf", base: pg_collection_path) do |rdf_path|
            counter = counter + 1
            break if counter >= books_loop_limit
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

            block.call(rdf_path: rdf_full_path, book_id: book_id)
        end
    end

    def parse_rdf(rdf_path: , book_id:)
        File.open(rdf_path) do |rdf_file| 
            xml_doc = Nokogiri::XML(rdf_file)
            parse_book(xml_doc, book_id)
        end
    end
    
    def parse_book(book_doc, book_id)
        book_title = book_doc.at_xpath("//dcterms:title").content

        authors_nodes = book_doc.xpath("//pgterms:agent")
        puts "Book #{book_id} has multiple authors" if debug? && authors_nodes.length > 1
        authors = authors_nodes.map &self.method(:parse_author)

        full_book_id = "#{LIBRARY_ITEMS_ID_PREFIX}#{book_id}"

        LibraryImport::Book.new(id: full_book_id, title: book_title, authors: authors)
    end

    def parse_author(author_node)
        author_id_node = author_node.at_xpath("./@rdf:about")
        if author_id_node.nil?
            puts "Can't extract PG author id from RDF file '#{rdf_path}'" if debug?
            return nil
        end

        author_id_raw = author_id_node.content
        author_id_match = author_id_raw.match(%r~^\d{4}/agents/(?<id>\d+)$~)
        if author_id_match.nil?
            puts "Can't extract PG author id from string '#{author_id_raw}'" if debug?
            return nil
        end

        full_author_id = "#{LIBRARY_ITEMS_ID_PREFIX}#{author_id_match[:id]}"
        author_name = author_node.at_xpath(".//pgterms:name").content
        author_birth_year = nil_if_zero author_node.at_xpath(".//pgterms:birthdate")&.content.to_i
        author_death_year = nil_if_zero author_node.at_xpath(".//pgterms:deathdate")&.content.to_i

        LibraryImport::Author.new(id: full_author_id, name: author_name, birth_year: author_birth_year, death_year: author_death_year)
    end

    def book_id_from_rdf_path(rdf_path)
        book_id_match = rdf_path.match(%r~^\d+/pg(?<pg_id>\d+).rdf$~)
        return nil if book_id_match.nil?
        return book_id_match[:pg_id]
    end

    def nil_if_zero(value)
        value == 0 ? nil : value
    end

    def debug?
        !!@@debug
    end

    def books_loop_limit
        @@books_loop_limit ||= Infinity
    end

end
