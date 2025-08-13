create or replace function hello_world() returns text as $$
  select 'Hello world';
$$ language sql;
