"use client";
import { useState, useEffect  } from "react";
import { Modal, Form, Button, Input, DatePicker, List, Select, Calendar, Tooltip   } from "antd";
import { DeleteOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined  } from '@ant-design/icons';
import moment from 'moment';



export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskId, setTaskId] = useState(null);



  const handleCancel = () => {
      setIsModalVisible(false);
  };

  const handleTaskNameChange = (e) => {
    setTaskName(e.target.value);
  };

  const handleTaskDeadlineChange = (date) => {
    setTaskDeadline(date);
  };

  function generateId() {
    return Math.floor(Math.random() * 1000000);
  }

  //додаємо таски


const addTask = async () => {
  if (taskName.trim() === "" || !taskDeadline) {
    alert("Будь ласка, введіть назву завдання та виберіть дедлайн.");
    return;
  }
  let status;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const deadlineDate = new Date(taskDeadline.format("YYYY-MM-DD"));
  if (deadlineDate < today) {
    status = 3; 
  } else {
    status = 4; 
  }

  const newTask = {
    id: generateId(),
    name: taskName,
    deadline: taskDeadline.format("YYYY-MM-DD"),
    status: status,
  };

  // відправляємо POST запит до API маршруту
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(newTask),
  });
  const data = await response.json();

  setTasks([...tasks, data.task]);

  setTaskName("");
  setTaskDeadline(null);
};


  //змінюємо таски

  const showModal = (task) => {
    setTaskId(task.id);
    setTaskName(task.name);
    setTaskDeadline(moment(task.deadline));
    setTaskStatus(task.status); 
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const deadlineDate = new Date(taskDeadline.format("YYYY-MM-DD"));
    if (deadlineDate < today && taskStatus === 4) {
      alert("З простроченним терміном нельзя ставити статус у роботі");
      return;
    }
    const updatedTask = {
      id: taskId,
      name: taskName,
      deadline: taskDeadline.format("YYYY-MM-DD"),
      status: taskStatus,
    };
    // відправляємо PUT запит до API маршруту
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    });
    const data = await response.json();

    setTasks(tasks.map(task => task.id === data.task.id ? data.task : task));

    setIsModalVisible(false);

    setTaskName("");
    setTaskDeadline(null);
    setTaskStatus(null);
  };



  // видалення тасків

  const handleDelete = async (id) => {
    // відправляємо DELETE запит до API маршруту
    const response = await fetch('/api/tasks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  
    if (!response.ok) {
      console.error(`Помилка API: ${response.status}`);
      return;
    }
  
    const data = await response.json();
    setTasks(tasks.filter(task => task.id !== data.id));
  };


  // Статуси тасків

  function getStatusIcon(status) {
    switch (status) {
      case 1:
        return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 2:
        return <CloseCircleOutlined style={{ color: 'red' }} />;
      case 3:
        return <ClockCircleOutlined style={{ color: '#04091b' }} />;
      case 4:
        return <SyncOutlined spin />;
      default:
        return null;
    }
  }

  //  Календар 

  const cellRender = (value) => {
    const listData = [];
    tasks.forEach(task => {
      if (value.isSame(moment(task.deadline), 'day')) {
        listData.push({ title: task.name, status: getStatusIcon(task.status) });
      }
    });
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            {item.title} - {item.status}
          </li>
        ))}
      </ul>
    );
  };





  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      const updatedTasks = data.tasks.map(task => {
        if (!task.status && moment(task.deadline).isBefore(moment())) {
          task.status = 3; 
        }
        return task;
      });
      setTasks(updatedTasks);
    };
    fetchTasks();
  }, []);

  


  return (
      <main>
          <div className="addTaskSection">
              <div className="addTaskRow">
                  <Input
                      placeholder="Назва завдання"
                      value={taskName}
                      onChange={handleTaskNameChange}
                  />
                  <DatePicker
                      placeholder="Дедлайн"
                      value={taskDeadline}
                      onChange={handleTaskDeadlineChange}
                  />
              </div>
              <Button type="primary" onClick={addTask}>
                  Додати завдання
              </Button>
          </div>
          <div className="taskListSection">
              <List
                  itemLayout="horizontal"
                  dataSource={tasks}
                  renderItem={(task) => (
                      <List.Item
                          actions={[
                              <Tooltip title="Редагувати">
                                  <Button
                                      icon={<EditOutlined />}
                                      onClick={() => showModal(task)}
                                  />
                              </Tooltip>,
                              <Tooltip title="Видалити">
                                  <Button
                                      className="deleteButton"
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDelete(task.id)}
                                  />
                              </Tooltip>,
                              <Tooltip title="Статус">
                                  <Button
                                      icon={getStatusIcon(task.status)}
                                      disabled
                                  />
                              </Tooltip>,
                          ]}
                      >
                          <List.Item.Meta
                              title={task.name}
                              description={`Дедлайн: ${moment(
                                  task.deadline
                              ).format("YYYY-MM-DD")}`}
                          />
                      </List.Item>
                  )}
              />
          </div>

          <div className="calendarSection">
              <Calendar cellRender={cellRender} />
          </div>

          <Modal
              title="Редагувати завдання"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
          >
              <Form>
                  <Form.Item label="Назва завдання">
                      <Input
                          value={taskName}
                          onChange={(e) => setTaskName(e.target.value)}
                      />
                  </Form.Item>
                  <Form.Item label="Дедлайн">
                      <DatePicker
                          value={taskDeadline}
                          onChange={(date) => setTaskDeadline(date)}
                      />
                  </Form.Item>
                  <Form.Item label="Статус">
                      <Select
                          value={taskStatus}
                          onChange={(value) => setTaskStatus(value)}
                      >
                          <Select.Option value={1}>Виконано</Select.Option>
                          <Select.Option value={2}>Відхилено</Select.Option>
                          <Select.Option value={4}>У роботі</Select.Option>
                      </Select>
                  </Form.Item>
              </Form>
          </Modal>
      </main>
  );
}