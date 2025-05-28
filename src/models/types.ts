
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  likedBy: string[]; // Track who has liked the post
  comments: Comment[];
  tags: string[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  technologies: string[];
}
