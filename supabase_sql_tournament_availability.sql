-- Table for player availability per tournament
create table if not exists tournament_availability (
  id bigint generated always as identity primary key,
  tournament_id bigint not null,
  player text not null,
  available boolean not null,
  constraint fk_tournament foreign key (tournament_id) references tournaments(id) on delete cascade
);

-- Index for fast lookup
create index if not exists idx_tournament_player on tournament_availability (tournament_id, player);
