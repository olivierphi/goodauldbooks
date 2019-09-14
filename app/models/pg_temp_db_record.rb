class PgTempDbRecord < ApplicationRecord
    self.abstract_class = true
   
    connects_to database: { writing: :pg_temp_db, reading: :pg_temp_db }
  end
