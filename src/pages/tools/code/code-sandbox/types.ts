export type InitialValuesType = {
  layout: 'horizontal' | 'vertical';
  autoRefresh: boolean;
};

export type CodeSandboxContent = {
  html: string;
  css: string;
  js: string;
};

export type Template = {
  name: string;
  content: CodeSandboxContent;
};

export const defaultTemplates: Template[] = [
  {
    name: 'Hello World',
    content: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to the Code Sandbox!</p>
  <button id="clickMe">Click Me!</button>
  <p id="output"></p>
</body>
</html>`,
      css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

h1 {
  color: #ffffff;
  text-align: center;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

p {
  color: #f0f0f0;
  text-align: center;
  font-size: 1.2em;
}

button {
  display: block;
  margin: 20px auto;
  padding: 15px 30px;
  font-size: 1.1em;
  background: #ffffff;
  color: #667eea;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

#output {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}`,
      js: `document.getElementById('clickMe').addEventListener('click', function() {
  const output = document.getElementById('output');
  const messages = [
    'Hello there! 👋',
    'Nice to meet you! 🎉',
    'How are you today? 😊',
    'Welcome to the sandbox! 🚀',
    'Keep coding! 💻'
  ];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  output.textContent = randomMessage;
  
  output.style.animation = 'none';
  output.offsetHeight;
  output.style.animation = 'pulse 0.5s ease';
});

const style = document.createElement('style');
style.textContent = \`
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
\`;
document.head.appendChild(style);`
    }
  },
  {
    name: 'Simple Counter',
    content: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple Counter</title>
</head>
<body>
  <div class="counter-container">
    <h1>Counter</h1>
    <div class="counter-value" id="counter">0</div>
    <div class="buttons">
      <button id="decrement">-</button>
      <button id="reset">Reset</button>
      <button id="increment">+</button>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.counter-container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2em;
}

.counter-value {
  font-size: 5em;
  font-weight: bold;
  color: #4a90d9;
  margin: 30px 0;
  font-family: 'Courier New', monospace;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

button {
  padding: 15px 30px;
  font-size: 1.2em;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

#decrement {
  background: #ff6b6b;
  color: white;
}

#decrement:hover {
  background: #ee5a5a;
  transform: scale(1.05);
}

#reset {
  background: #95a5a6;
  color: white;
}

#reset:hover {
  background: #7f8c8d;
  transform: scale(1.05);
}

#increment {
  background: #51cf66;
  color: white;
}

#increment:hover {
  background: #40c057;
  transform: scale(1.05);
}`,
      js: `let count = 0;

const counterElement = document.getElementById('counter');
const decrementBtn = document.getElementById('decrement');
const incrementBtn = document.getElementById('increment');
const resetBtn = document.getElementById('reset');

function updateDisplay() {
  counterElement.textContent = count;
  
  if (count > 0) {
    counterElement.style.color = '#51cf66';
  } else if (count < 0) {
    counterElement.style.color = '#ff6b6b';
  } else {
    counterElement.style.color = '#4a90d9';
  }
  
  counterElement.style.transform = 'scale(1.2)';
  setTimeout(() => {
    counterElement.style.transform = 'scale(1)';
  }, 150);
}

decrementBtn.addEventListener('click', () => {
  count--;
  updateDisplay();
});

incrementBtn.addEventListener('click', () => {
  count++;
  updateDisplay();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});`
    }
  },
  {
    name: 'Todo List',
    content: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List</title>
</head>
<body>
  <div class="todo-container">
    <h1>📝 Todo List</h1>
    <div class="input-section">
      <input type="text" id="todoInput" placeholder="Add a new task...">
      <button id="addBtn">Add</button>
    </div>
    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </div>
    <ul id="todoList"></ul>
    <div class="footer">
      <span id="itemsLeft">0 items left</span>
      <button id="clearCompleted">Clear Completed</button>
    </div>
  </div>
</body>
</html>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  min-height: 100vh;
  padding: 20px;
}

.todo-container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 2em;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

#todoInput {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.3s;
}

#todoInput:focus {
  border-color: #f5576c;
}

#addBtn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.2s;
}

#addBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 87, 108, 0.4);
}

.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #f5576c;
  color: white;
  border-color: #f5576c;
}

.filter-btn:hover:not(.active) {
  border-color: #f5576c;
}

#todoList {
  list-style: none;
  margin-bottom: 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #f0f0f0;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  margin-right: 15px;
  cursor: pointer;
  accent-color: #f5576c;
}

.todo-text {
  flex: 1;
  font-size: 1em;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.2em;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
  padding: 5px;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

#itemsLeft {
  color: #666;
}

#clearCompleted {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  text-decoration: underline;
}

#clearCompleted:hover {
  color: #ee5a5a;
}`,
      js: `let todos = [];
let currentFilter = 'all';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const itemsLeft = document.getElementById('itemsLeft');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
  const saved = localStorage.getItem('todos');
  if (saved) {
    todos = JSON.parse(saved);
  }
}

function updateItemsLeft() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  itemsLeft.textContent = \`\${activeCount} item\${activeCount !== 1 ? 's' : ''} left\`;
}

function renderTodos() {
  let filteredTodos = todos;
  
  if (currentFilter === 'active') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }
  
  todoList.innerHTML = '';
  
  filteredTodos.forEach((todo, index) => {
    const originalIndex = todos.findIndex(t => t.id === todo.id);
    const li = document.createElement('li');
    li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
    li.innerHTML = \`
      <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} data-id="\${todo.id}">
      <span class="todo-text">\${todo.text}</span>
      <button class="delete-btn" data-id="\${todo.id}">🗑️</button>
    \`;
    todoList.appendChild(li);
  });
  
  updateItemsLeft();
}

function addTodo(text) {
  if (text.trim() === '') return;
  
  const todo = {
    id: Date.now(),
    text: text.trim(),
    completed: false
  };
  
  todos.unshift(todo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompletedTodos() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
}

addBtn.addEventListener('click', () => addTodo(todoInput.value));

todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo(todoInput.value);
  }
});

todoList.addEventListener('click', (e) => {
  const target = e.target;
  
  if (target.classList.contains('todo-checkbox')) {
    toggleTodo(parseInt(target.dataset.id));
  }
  
  if (target.classList.contains('delete-btn')) {
    deleteTodo(parseInt(target.dataset.id));
  }
});

clearCompleted.addEventListener('click', clearCompletedTodos);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

loadTodos();
renderTodos();`
    }
  }
];
