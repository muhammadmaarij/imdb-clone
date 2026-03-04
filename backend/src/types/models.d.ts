export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserWithoutPassword = Omit<UserAttributes, "password">;

export interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
}

export interface MovieAttributes {
  id: string;
  title: string;
  releaseDate: Date;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  userId: string;
  reviewCount: number; // pre-calculated column, maintained by PG trigger
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovieCreationAttributes {
  title: string;
  releaseDate: Date;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  userId: string;
}

export interface ReviewAttributes {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewCreationAttributes {
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
}

// rank is derived at read time from the indexed reviewCount column — not stored.
export interface MovieWithRanking extends MovieAttributes {
  rank: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedMovies {
  movies: MovieWithRanking[];
  pagination: PaginationMeta;
}
