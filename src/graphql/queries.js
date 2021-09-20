import { gql } from "@apollo/client";

export const GET_ALL_TODOS = gql`
  query GET_ALL_TODOS {
    getAllTodos {
      id
      title
      content
      completed
    }
  }
`;

export const UPDATE_TODO_STATUS = gql`
  mutation UPDATE_TODO_STATUS($CompletedStatus: completedStatus!, $Id: ID!) {
    updateTodoStatusById(completedStatus: $CompletedStatus, id: $Id) {
      id
      title
      content
      completed
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DELETE_TODO_BY_ID($id: ID!) {
    deleteTodoById(id: $id) {
      id
      message
      success
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UPDATE_TODO_BY_ID($UpdatedTodo: TodoInput!, $id: ID!) {
    updateTodoByID(updatedTodo: $UpdatedTodo, id: $id) {
      id
      title
      content
      completed
    }
  }
`;

export const CREATE_TODO = gql`
  mutation CREATE_TODO($NewTodo: TodoInput!) {
    createNewTodo(newTodo: $NewTodo) {
      id
      title
      content
      completed
    }
  }
`;
