CREATE  INDEX "posts_dao_project_id_index" on
  "public"."posts" using btree ("onchain_dao_project_id");
