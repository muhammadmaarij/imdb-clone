export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserWithoutPassword = Omit<UserAttributes, 'password'>;

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

export interface MovieWithRanking extends MovieAttributes {
  reviewCount?: number;
  rank?: number;
}
