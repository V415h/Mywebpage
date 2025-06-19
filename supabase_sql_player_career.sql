-- SQL for player_career table in Supabase
create table if not exists player_career (
  id serial primary key,
  player_name text not null,
  age integer,
  batting_style text,
  bowling_style text,
  career_best_score integer,
  year_best_score integer,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
