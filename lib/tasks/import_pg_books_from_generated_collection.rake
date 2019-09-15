namespace :import do
    namespace :pg do
        desc "Import library from a Project Gutenberg 'generated' rsync-ed collection"
        task import_books_from_generated_collection: [:environment] do
            rsynced_generated_collection_path = ENV.fetch("PG_COLLECTION_PATH", "")
            if rsynced_generated_collection_path.blank?
                puts "Please pass 'PG_COLLECTION_PATH' env var to this task."
                exit(false)
            end
            unless Dir.exists? rsynced_generated_collection_path
                puts "'PG_COLLECTION_PATH' env var is not a valid dir path."
                exit(false)
            end

            ProjectGutenberg::Import::GeneratedCollectionImporter.new.import(
                rsynced_generated_collection_path,
                wipe_previous_data: true
            )
        end
    end
end
