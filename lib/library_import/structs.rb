module LibraryImport
    Book = Struct.new(:id, :title, :authors, keyword_init: true)
    Author = Struct.new(:id, :name, :birth_year, :death_year, keyword_init: true)
end
