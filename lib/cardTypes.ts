export type Card = {
  id: string;
  card_id: string;
  player_name: string;
  season_text: string | null;
  season_end: number | null;
  series: string | null;
  country: string | null;
  club: string | null;
  overall: number;
  gol: number;
  asist: number;
  regate: number;
  pase: number;
  def: number;
  scores: CardScores | null;
  image_url: string | null;
  face_url: string | null;
  stats: CardStats | null;
  metadata?: CardMetadata | null;
};

export type CardIndex = Omit<Card, "stats"> & {
  stats?: CardStats | null;
  has_stats?: boolean;
  search_text?: string;
};

export type CardScores = {
  overall: number | null;
  gol: number | null;
  asist: number | null;
  regate: number | null;
  pase: number | null;
  def: number | null;
};

export type CardStats = {
  minutes: number | null;
  goals: number | null;
  goals_per_90: number | null;
  assists: number | null;
  key_passes: number | null;
  key_passes_per_90: number | null;
  successful_dribbles: number | null;
  successful_dribbles_per_90: number | null;
  total_passes: number | null;
  total_passes_per_90: number | null;
  pass_accuracy: number | null;
  tackles: number | null;
  tackles_per_90: number | null;
  interceptions: number | null;
  interceptions_per_90: number | null;
  base_score: number | null;
  visual_score: number | null;
};

export type RankKey = "overall" | "gol" | "asist" | "regate" | "pase" | "def";

export type CardMetadata = {
  schema_version: string;
  formula_version: string;
  data_source_version: string;
  source_file?: string;
};
