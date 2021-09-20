import React, { useState } from "react";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Typography,
  Tag,
  Switch,
  Button,
} from "antd";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { AddTodo } from "./AddTodo";
import {
  DELETE_TODO,
  GET_ALL_TODOS,
  UPDATE_TODO,
  UPDATE_TODO_STATUS,
} from "../graphql/queries";
import {
  ON_TODO_CREATED,
  ON_TODO_DELETED,
  ON_TODO_UPDATED,
} from "../graphql/subscriptions";

const { Text } = Typography;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const TodoList = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState("");

  useSubscription(ON_TODO_DELETED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newData = [...data];
      const result = newData.filter(
        (todo) => todo.key !== subscriptionData.data.todoDeleted
      );
      setData(result);
    },
  });

  useSubscription(ON_TODO_UPDATED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newData = [...data];

      const key = subscriptionData.data.todoUpdated.id;

      const index = newData.findIndex((todo) => todo.key === key);

      newData[index] = subscriptionData.data.todoUpdated;
      newData[index].key = key;

      setData(newData);
    },
  });

  useSubscription(ON_TODO_CREATED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log("h1");
      const newData = [...data];

      const newTodo = {
        key: subscriptionData.data.todoCreated.id,
        title: subscriptionData.data.todoCreated.title,
        content: subscriptionData.data.todoCreated.content,
        completed: subscriptionData.data.todoCreated.completed,
      };

      newData.unshift(newTodo);

      setData(newData);
    },
  });

  useQuery(GET_ALL_TODOS, {
    onCompleted: ({ getAllTodos }) => {
      console.log(getAllTodos);
      const todos = getAllTodos.map((todo) => {
        return {
          key: todo.id,
          title: todo.title,
          content: todo.content,
          completed: todo.completed,
        };
      });

      setData(todos);
    },
  });

  const [updateTodoStatus] = useMutation(UPDATE_TODO_STATUS, {
    onError: (error) => console.log(error),
  });

  const [deleteTodo] = useMutation(DELETE_TODO, {
    onError: (error) => console.log(error),
  });

  const [updateTodo] = useMutation(UPDATE_TODO, {
    onError: (error) => console.log(error),
  });

  function changeTodoStatus(record) {
    updateTodoStatus({
      variables: {
        CompletedStatus: { completed: !record.completed },
        Id: record.key,
      },
    });
  }

  function onDelete(record) {
    deleteTodo({
      variables: {
        id: record.key,
      },
    });
  }

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      title: "",
      content: "",
      completed: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();

      updateTodo({
        variables: {
          UpdatedTodo: {
            title: row.title,
            content: row.content,
          },
          id: key,
        },
      });

      setEditingKey("");
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      editable: true,
    },
    {
      title: "Content",
      dataIndex: "content",
      width: "45%",
      editable: true,
    },
    {
      title: "Status",
      dataIndex: "completed",
      width: "20%",
      render: (completed) => (
        <Tag color={completed ? "green" : "volcano"}>
          {completed ? <Text>Completed</Text> : <Text>Not Done</Text>}
        </Tag>
      ),
    },
    {
      title: "Edit",
      dataIndex: "edit",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      },
    },
    {
      title: "Operation",
      dataIndex: "completed",
      render: (_, record) => (
        <Switch
          checked={record.completed}
          onChange={() => changeTodoStatus(record)}
        />
      ),
    },
    {
      title: "Delete",
      dataIndex: "delete",
      render: (_, record) => (
        <Button onClick={() => onDelete(record)}>Delete</Button>
      ),
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <AddTodo />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
    </>
  );
};
