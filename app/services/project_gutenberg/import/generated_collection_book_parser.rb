require "library_import/structs"

module ProjectGutenberg
    module Import 
        class GeneratedCollectionBookParser
            LIBRARY_ITEMS_ID_PREFIX = "pg."
            DEBUG = true

            class << self

                @@debug = true

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

                private

                def nil_if_zero(value)
                    value == 0 ? nil : value
                end

                def debug?
                    !!DEBUG
                end

            end
        end
    end
end
