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
import { AddTodo } from "./AddTodo";

const { Text } = Typography;

const originData = [];

for (let i = 0; i < 10; i++) {
  originData.push({
    key: i.toString(),
    title: `TEST TITLE`,
    content: "TEST CONTENT",
    completed: true,
  });
}

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
  const [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState("");

  function onChange(record) {
    console.log(`record : `, record);
    const newData = [...data];
    const index = newData.findIndex((item) => item.key === record.key);
    newData[index].completed = !newData[index].completed;
    setData(newData);
    console.log(newData);
  }

  function onDelete(record) {
    console.log(`delete:`, record);
    const newData = [...data];
    const res = newData.filter((item) => item.key !== record.key);
    setData(res);
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
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        console.log("new:", newData);
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
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
        <Switch checked={record.completed} onChange={() => onChange(record)} />
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
