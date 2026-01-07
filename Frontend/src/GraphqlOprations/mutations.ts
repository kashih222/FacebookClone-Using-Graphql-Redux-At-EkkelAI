export const SIGNUP_MUTATION = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      id
      firstName
      surname
      email
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        firstName
        surname
        email
      }
    }
  }
`;

export const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;

export const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      content
      imageUrl
      imageUrls
      author {
        id
        firstName
        surname
        email
      }
      createdAt
    }
  }
`;

export const GET_UPLOAD_TARGETS_MUTATION = `
  mutation GetUploadTargets($requests: [UploadRequest!]!) {
    getUploadTargets(requests: $requests) {
      uploadUrl
      publicUrl
      fields { key value }
    }
  }
`;

export const GET_VIEW_URLS_MUTATION = `
  mutation GetViewUrls($urls: [String!]!) {
    getViewUrls(urls: $urls)
  }
`;

export const REACT_POST_MUTATION = `
  mutation ReactPost($input: ReactPostInput!) {
    reactPost(input: $input) {
      id
      content
      imageUrl
      imageUrls
      author { id firstName surname email }
      createdAt
      comments {
        id
        content
        createdAt
        author { id firstName surname email }
      }
      reactions {
        type
        createdAt
        user { id }
      }
      reactionSummary { like love haha wow sad angry }
    }
  }
`;

export const ADD_COMMENT_MUTATION = `
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      content
      imageUrl
      imageUrls
      author { id firstName surname email }
      createdAt
      comments {
        id
        content
        createdAt
        author { id firstName surname email }
      }
      reactions {
        type
        createdAt
        user { id }
      }
      reactionSummary { like love haha wow sad angry }
    }
  }
`;

export const ADD_FRIEND_MUTATION = `
  mutation AddFriend($userId: ID!) {
    addFriend(userId: $userId)
  }
`;

export const SEND_FRIEND_REQUEST_MUTATION = `
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId)
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = `
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId)
  }
`;

export const REJECT_FRIEND_REQUEST_MUTATION = `
  mutation RejectFriendRequest($requestId: ID!) {
    rejectFriendRequest(requestId: $requestId)
  }
`;




