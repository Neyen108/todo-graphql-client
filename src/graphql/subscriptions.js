import { gql } from "@apollo/client";

export const ON_TODO_DELETED = gql`
  subscription ON_TODO_DELETED {
    todoDeleted
  }
`;

export const ON_TODO_UPDATED = gql`
  subscription ON_TODO_UPDATED {
    todoUpdated {
      id
      title
      content
      completed
    }
  }
`;

export const ON_TODO_CREATED = gql`
  subscription ON_TODO_CREATED {
    todoCreated {
      id
      title
      content
      completed
    }
  }
`;
