create function echo(say text) returns text as $$
  select say;
$$ language sql;
