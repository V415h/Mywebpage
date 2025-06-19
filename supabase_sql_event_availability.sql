-- SQL for event_availability table in Supabase
create table if not exists event_availability (
  id serial primary key,
  event_id text not null,
  player text not null,
  available boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
