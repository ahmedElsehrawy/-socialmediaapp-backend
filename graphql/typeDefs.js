const { gql } = require("apollo-server");

module.exports = gql`
  type Comment {
    _id: ID!
    body: String!
    username: String!
    createdAt: String!
  }

  type Like {
    _id: ID!
    username: String!
    createdAt: String!
  }

  type Post {
    _id: ID!
    body: String!
    username: String!
    comments: [Comment!]
    likes: [Like!]
    user: String!
    likeCount: Int!
    commentCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    username: String!
    token: String!
    createdAt: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type PostPagination {
    count: Int!
    nodes: [Post!]
  }

  type Query {
    getPosts(page: Int!): PostPagination!
    getPost(postId: ID!): Post!
    me: User!
  }

  type Mutation {
    register(registerInput: RegisterInput!): User!
    login(username: String!, password: String!): User!
    createPost(body: String): Post!
    deletePost(postId: ID!): Post!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }

  type Subscription {
    newPost: Post!
  }
`;
