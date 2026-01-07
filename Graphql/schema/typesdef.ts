export const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    surname: String!
    email: String!
    dob: String!
    gender: String!
    createdAt: String!
  }

  input SignupInput {
    firstName: String!
    surname: String!
    email: String!
    password: String!
    day: Int!
    month: String!
    year: Int!
    gender: String!
  }

 

  type AuthPayload {
    token: String!
    user: User!
  }

  enum ReactionType {
    like
    love
    haha
    wow
    sad
    angry
  }

  
  input ReactPostInput {
    postId: ID!
    type: ReactionType!
  }

  type Reaction {
    user: User!
    type: String!
    createdAt: String!
  }

  type Comment {
    id: ID!
    author: User!
    content: String!
    createdAt: String!
  }

  type ReactionSummary {
    like: Int!
    love: Int!
    haha: Int!
    wow: Int!
    sad: Int!
    angry: Int!
  }

  
  type Post {
    id: ID!
    content: String!
    imageUrl: String
    imageUrls: [String]
    author: User!
    createdAt: String!
    comments: [Comment!]!
    reactions: [Reaction!]!
    reactionSummary: ReactionSummary!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    createdAt: String!
  }
    
  input CreatePostInput {
    content: String!
    imageUrl: String
    imageUrls: [String]
  }
  
  input AddCommentInput {
    postId: ID!
    content: String!
  }

  
  input UploadRequest {
    filename: String!
    contentType: String!
  }
  
  type UploadField {
    key: String!
    value: String!
  }
  
  type UploadTarget {
    uploadUrl: String!
    publicUrl: String!
    fields: [UploadField!]
  }

  type FriendRequest {
    id: ID!
    from: User!
    to: User!
    status: String!
    createdAt: String!
  }

  type Query {
    greet: String
    me: User
    posts: [Post!]!
    myPosts: [Post!]!
    users: [User!]!
    myFriends: [User!]!
    friendSuggestions: [User!]!
    friendRequests: [FriendRequest!]!
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createPost(input: CreatePostInput!): Post!
    getUploadTargets(requests: [UploadRequest!]!): [UploadTarget!]!
    getViewUrls(urls: [String!]!): [String!]!
    addFriend(userId: ID!): Boolean!
    sendFriendRequest(userId: ID!): Boolean!
    acceptFriendRequest(requestId: ID!): Boolean!
    rejectFriendRequest(requestId: ID!): Boolean!
    addComment(input: AddCommentInput!): Post!
    reactPost(input: ReactPostInput!): Post!
  }
`;
