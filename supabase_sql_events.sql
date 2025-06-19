-- SQL for events table in Supabase
create table if not exists events (
  id serial primary key,
  name text not null,
  date date not null,
  description text,
  created_by text not null, -- username or player name
  created_at timestamp with time zone default timezone('utc'::text, now())
);
