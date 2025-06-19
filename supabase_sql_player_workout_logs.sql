-- SQL for player_workout_logs table in Supabase
create table if not exists player_workout_logs (
  id serial primary key,
  player_name text not null,
  date date not null default current_date,
  workout text not null,
  is_weight boolean default false,
  weight integer,
  sets integer,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
