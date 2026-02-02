export type POST = {
  id: string;
  title: string;
  content: string;
  imageKey?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type COMMENT = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
};

export type CREATE_POST_INPUT = {
  title: string;
  content: string;
  imageKey?: string;
};

export type UPDATE_POST_INPUT = {
  title?: string;
  content?: string;
  imageKey?: string;
};

export type CREATE_COMMENT_INPUT = {
  content: string;
};
