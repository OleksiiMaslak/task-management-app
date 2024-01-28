// Залаємо таски за замовчуванням для наглядності 
let tasks = [
  {
    id: Math.floor(Math.random() * 1000000),
    name: 'Завдання 1',
    deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    status: 4, 
  },
  {
    id: Math.floor(Math.random() * 1000000),
    name: 'Завдання 2',
    deadline: new Date(Date.now() + 35*24*60*60*1000).toISOString().split('T')[0],
    status: 4, 
  },
  {
    id: Math.floor(Math.random() * 1000000),
    name: 'Завдання 3',
    deadline: new Date(Date.now() + 40*24*60*60*1000).toISOString().split('T')[0],
    status: 4, 
  },
];

// Обробка запитів і надання відповіді

export default async function handler(req, res) {
  const { method, body } = req;

  switch (method) {
    case 'GET':
      res.status(200).json({ tasks });
      break;
    case 'POST':
      const newTask = { ...body, id: Math.floor(Math.random() * 1000000) };
      tasks.push(newTask);
      res.status(200).json({ task: newTask });
      break;
    case 'PUT':
      const updatedTask = { ...body };
      tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
      res.status(200).json({ task: updatedTask });
      break;
    case 'DELETE':
      tasks = tasks.filter(task => task.id !== body.id);
      res.status(200).json({ id: body.id });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}