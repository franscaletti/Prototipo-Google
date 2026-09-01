# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :google_uid
      t.string :name
      t.string :avatar_url
      t.string :role, null: false, default: "usuario"

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :google_uid, unique: true
  end
end
