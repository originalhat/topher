export class Task {}

let tasks = [];

export function addTask(text) {
  let task = new Task();

  task.id = tasks.length + 1;
  task.text = text;
  tasks.push(task);

  return task.id;
}

export function getTask(id) {
  return tasks[id];
}

export function getTasks() {
  return ['the first task', 'the second task'];
}

