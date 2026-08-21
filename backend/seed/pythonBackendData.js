/**
 * Python Backend Development syllabus (subject: 'python').
 * Full Section (Module) -> Topic -> SubTopic hierarchy.
 * Project sections are `optional: true` so they never count toward progress.
 */

const st = (title, { difficulty = 'medium', estimatedTime = '' } = {}) => ({
  title,
  description: '',
  difficulty,
  estimatedTime,
});

const top = (title, subtopicsOrOptions = []) => {
  if (Array.isArray(subtopicsOrOptions)) {
    return { title, description: '', subtopics: subtopicsOrOptions };
  }
  return { title, description: subtopicsOrOptions?.description || '', subtopics: [] };
};

const sec = (title, topics = [], { description = '', optional = false } = {}) => ({
  title,
  description,
  optional,
  topics,
});

export const pythonBackendSections = [
  // ------------------------------------------------------------------
  // Module 1 — Python Fundamentals
  // ------------------------------------------------------------------
  sec(
    'Python Fundamentals',
    [
      top('Python Introduction', [
        st('What is Python?', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Python use cases', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Python installation', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Python interpreter', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Python syntax', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Running Python programs', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Python REPL', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('VS Code Python setup', { difficulty: 'easy', estimatedTime: '30 min' }),
      ]),
      top('Variables and Data Types', [
        st('Variables', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Naming conventions', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('int', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('float', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('complex', { difficulty: 'medium', estimatedTime: '20 min' }),
        st('string', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('boolean', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('None', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('type()', { difficulty: 'easy', estimatedTime: '10 min' }),
        st('type conversion', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('mutable vs immutable', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Operators', [
        st('Arithmetic operators', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Assignment operators', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Comparison operators', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Logical operators', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Identity operators', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Membership operators', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Operator precedence', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Conditional Statements', [
        st('if', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('elif', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('else', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Nested conditions', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Ternary operator', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Loops', [
        st('for loop', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('while loop', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('range()', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('break', { difficulty: 'medium', estimatedTime: '20 min' }),
        st('continue', { difficulty: 'medium', estimatedTime: '20 min' }),
        st('pass', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('nested loops', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
    ],
    { description: 'The foundations of Python — syntax, types, operators, conditionals and loops.' }
  ),

  // ------------------------------------------------------------------
  // Module 2 — Python Data Structures
  // ------------------------------------------------------------------
  sec(
    'Python Data Structures',
    [
      top('Strings', [
        st('Indexing', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Slicing', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('String methods', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Formatting', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('f-strings', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Regular expressions basics', { difficulty: 'hard', estimatedTime: '60 min' }),
      ]),
      top('Lists', [
        st('Creating lists', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Indexing', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Slicing', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('List methods', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Nested lists', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('List comprehension', { difficulty: 'medium', estimatedTime: '40 min' }),
      ]),
      top('Tuples', [
        st('Tuple creation', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Tuple unpacking', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Tuple methods', { difficulty: 'easy', estimatedTime: '20 min' }),
      ]),
      top('Sets', [
        st('Set operations', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Union', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Intersection', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Difference', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Set comprehension', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Dictionaries', [
        st('Keys and values', { difficulty: 'easy', estimatedTime: '25 min' }),
        st('Dictionary methods', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Nested dictionaries', { difficulty: 'medium', estimatedTime: '40 min' }),
        st('Dictionary comprehension', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Advanced Iteration', [
        st('enumerate()', { difficulty: 'medium', estimatedTime: '25 min' }),
        st('zip()', { difficulty: 'medium', estimatedTime: '25 min' }),
        st('map()', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('filter()', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('sorted()', { difficulty: 'easy', estimatedTime: '25 min' }),
        st('any()', { difficulty: 'medium', estimatedTime: '20 min' }),
        st('all()', { difficulty: 'medium', estimatedTime: '20 min' }),
      ]),
    ],
    { description: 'Strings, lists, tuples, sets, dictionaries and functional iteration idioms.' }
  ),

  // ------------------------------------------------------------------
  // Module 3 — Functions
  // ------------------------------------------------------------------
  sec(
    'Functions',
    [
      top('Function basics'),
      top('Parameters'),
      top('Arguments'),
      top('Default arguments'),
      top('Keyword arguments'),
      top('Positional arguments'),
      top('*args', [{ title: '*args', description: '', difficulty: 'hard', estimatedTime: '40 min' }]),
      top('**kwargs', [{ title: '**kwargs', description: '', difficulty: 'hard', estimatedTime: '40 min' }]),
      top('Return values'),
      top('Scope'),
      top('Local/global variables'),
      top('Lambda functions', [{ title: 'Lambda functions', description: '', difficulty: 'medium', estimatedTime: '30 min' }]),
      top('Higher-order functions'),
      top('Recursion'),
      top('Type hints'),
      top('Docstrings'),
    ],
    { description: 'Reusable logic — parameters, scoping, lambdas, recursion and typing.' }
  ),

  // ------------------------------------------------------------------
  // Module 4 — Object-Oriented Programming
  // ------------------------------------------------------------------
  sec(
    'Object-Oriented Programming',
    [
      top('Classes and objects'),
      top('__init__()'),
      top('Instance variables'),
      top('Class variables'),
      top('Instance methods'),
      top('Class methods'),
      top('Static methods'),
      top('Encapsulation'),
      top('Inheritance'),
      top('Multiple inheritance'),
      top('Method overriding'),
      top('Polymorphism'),
      top('Abstraction'),
      top('Abstract classes'),
      top('Interfaces/protocols'),
      top('Magic/dunder methods', [
        st('__str__()', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('__repr__()', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('__eq__()', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('__len__()', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
    ],
    { description: 'Object-oriented design — classes, inheritance, abstraction and dunder methods.' }
  ),

  // ------------------------------------------------------------------
  // Module 5 — Exception Handling
  // ------------------------------------------------------------------
  sec(
    'Exception Handling',
    [
      top('Exceptions'),
      top('try'),
      top('except'),
      top('else'),
      top('finally'),
      top('Multiple exceptions'),
      top('raise'),
      top('Custom exceptions'),
      top('Exception hierarchy'),
      top('Error handling best practices'),
    ],
    { description: 'Handling errors gracefully with Python exception machinery.' }
  ),

  // ------------------------------------------------------------------
  // Module 6 — Files and Data Handling
  // ------------------------------------------------------------------
  sec(
    'Files and Data Handling',
    [
      top('File handling'),
      top('open()'),
      top('Reading files'),
      top('Writing files'),
      top('Append mode'),
      top('Context managers'),
      top('with statement'),
      top('CSV'),
      top('JSON'),
      top('Pickle basics'),
      top('pathlib'),
      top('Working with directories'),
    ],
    { description: 'Reading and writing files, structured data formats and filesystem handling.' }
  ),

  // ------------------------------------------------------------------
  // Module 7 — Modules, Packages and Environments
  // ------------------------------------------------------------------
  sec(
    'Modules, Packages and Environments',
    [
      top('import'),
      top('from import'),
      top('Creating modules'),
      top('Creating packages'),
      top('__init__.py'),
      top('Python package structure'),
      top('pip'),
      top('Virtual environments'),
      top('venv'),
      top('requirements.txt'),
      top('pyproject.toml'),
      top('Environment variables'),
      top('.env'),
      top('python-dotenv'),
    ],
    { description: 'Organizing code into modules/packages and isolating environments.' }
  ),

  // ------------------------------------------------------------------
  // Module 8 — Advanced Python
  // ------------------------------------------------------------------
  sec(
    'Advanced Python',
    [
      top('Iterators'),
      top('Iterables'),
      top('Generators'),
      top('yield'),
      top('Decorators'),
      top('Context managers'),
      top('Closures'),
      top('Comprehensions'),
      top('Dataclasses'),
      top('Enums'),
      top('Type hints'),
      top('typing module'),
      top('Async programming'),
      top('async/await'),
      top('asyncio'),
      top('Threads'),
      top('Multiprocessing'),
    ],
    { description: 'Generators, decorators, dataclasses, typing and concurrency.' }
  ),

  // ------------------------------------------------------------------
  // Module 9 — Backend Fundamentals
  // ------------------------------------------------------------------
  sec(
    'Backend Fundamentals',
    [
      top('Client-server architecture'),
      top('HTTP'),
      top('HTTPS'),
      top('Request/response lifecycle'),
      top('HTTP methods'),
      top('GET', [{ title: 'GET', description: '', difficulty: 'easy', estimatedTime: '15 min' }]),
      top('POST', [{ title: 'POST', description: '', difficulty: 'easy', estimatedTime: '15 min' }]),
      top('PUT', [{ title: 'PUT', description: '', difficulty: 'easy', estimatedTime: '15 min' }]),
      top('PATCH', [{ title: 'PATCH', description: '', difficulty: 'easy', estimatedTime: '15 min' }]),
      top('DELETE', [{ title: 'DELETE', description: '', difficulty: 'easy', estimatedTime: '15 min' }]),
      top('HTTP status codes'),
      top('Headers'),
      top('Cookies'),
      top('Sessions'),
      top('JSON'),
      top('REST architecture'),
      top('REST API design'),
      top('API versioning'),
    ],
    { description: 'How the web works under the hood — HTTP, REST and API design.' }
  ),

  // ------------------------------------------------------------------
  // Module 10 — FastAPI
  // ------------------------------------------------------------------
  sec(
    'FastAPI',
    [
      top('FastAPI introduction'),
      top('Project setup'),
      top('Application structure'),
      top('Routes'),
      top('Path parameters'),
      top('Query parameters'),
      top('Request body'),
      top('Pydantic'),
      top('Pydantic models'),
      top('Data validation'),
      top('Response models'),
      top('Status codes'),
      top('Headers'),
      top('Cookies'),
      top('Middleware'),
      top('CORS'),
      top('Dependency injection'),
      top('Background tasks'),
      top('File uploads'),
      top('Error handling'),
      top('Custom exceptions'),
      top('OpenAPI'),
      top('Swagger documentation'),
      top('ReDoc'),
      top('Async endpoints'),
    ],
    { description: 'Modern async Python APIs with FastAPI and Pydantic.' }
  ),

  // ------------------------------------------------------------------
  // Module 11 — Databases
  // ------------------------------------------------------------------
  sec(
    'Databases',
    [
      top('SQL', [
        st('Database fundamentals', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Tables', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Rows', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Columns', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Primary keys', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Foreign keys', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('SQL basics', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('SELECT', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('INSERT', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('UPDATE', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('DELETE', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('WHERE', { difficulty: 'easy', estimatedTime: '25 min' }),
        st('ORDER BY', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('GROUP BY', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('JOIN', { difficulty: 'hard', estimatedTime: '60 min' }),
        st('Aggregate functions', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Indexes', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Transactions', { difficulty: 'hard', estimatedTime: '60 min' }),
      ]),
      top('PostgreSQL', [
        st('PostgreSQL setup', { difficulty: 'easy', estimatedTime: '45 min' }),
        st('Database creation', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Users and permissions', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('PostgreSQL with Python', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('SQLAlchemy', { difficulty: 'hard', estimatedTime: '90 min' }),
        st('ORM', { difficulty: 'medium', estimatedTime: '60 min' }),
        st('Models', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Relationships', { difficulty: 'hard', estimatedTime: '60 min' }),
        st('CRUD', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Migrations', { difficulty: 'medium', estimatedTime: '60 min' }),
        st('Alembic', { difficulty: 'hard', estimatedTime: '60 min' }),
      ]),
      top('MongoDB', [
        st('MongoDB fundamentals', { difficulty: 'easy', estimatedTime: '45 min' }),
        st('Documents', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('Collections', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('CRUD', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Queries', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Indexes', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('MongoDB with Python', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('PyMongo', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('MongoDB schema design', { difficulty: 'hard', estimatedTime: '60 min' }),
      ]),
    ],
    { description: 'Relational (SQL/PostgreSQL) and document (MongoDB) databases with Python.' }
  ),

  // ------------------------------------------------------------------
  // Module 12 — Authentication and Security
  // ------------------------------------------------------------------
  sec(
    'Authentication and Security',
    [
      top('Authentication vs authorization'),
      top('Password hashing'),
      top('bcrypt'),
      top('JWT'),
      top('Access tokens'),
      top('Refresh tokens'),
      top('OAuth2'),
      top('FastAPI security'),
      top('Role-based access control'),
      top('GitHub OAuth'),
      top('API keys'),
      top('CORS security'),
      top('Input validation'),
      top('Rate limiting'),
      top('Secrets management'),
      top('Environment variables'),
      top('SQL injection'),
      top('NoSQL injection'),
      top('XSS'),
      top('CSRF'),
      top('OWASP basics'),
    ],
    { description: 'Secure identity, access control and defending against common web attacks.' }
  ),

  // ------------------------------------------------------------------
  // Module 13 — Testing
  // ------------------------------------------------------------------
  sec(
    'Testing',
    [
      top('Unit testing'),
      top('Integration testing'),
      top('pytest'),
      top('Fixtures'),
      top('Mocking'),
      top('API testing'),
      top('FastAPI TestClient'),
      top('Database testing'),
      top('Test coverage'),
      top('Testing authentication'),
      top('Testing edge cases'),
    ],
    { description: 'Automated confidence with pytest, mocking and API/database tests.' }
  ),

  // ------------------------------------------------------------------
  // Module 14 — Production Backend
  // ------------------------------------------------------------------
  sec(
    'Production Backend',
    [
      top('Backend architecture'),
      top('Layered architecture'),
      top('Service layer'),
      top('Repository pattern'),
      top('Configuration management'),
      top('Logging'),
      top('Error monitoring'),
      top('API documentation'),
      top('Performance optimization'),
      top('Caching'),
      top('Redis'),
      top('Background workers'),
      top('Celery'),
      top('Task queues'),
      top('WebSockets'),
      top('Real-time APIs'),
    ],
    { description: 'Architecture, caching, background jobs and real-time features in production.' }
  ),

  // ------------------------------------------------------------------
  // Module 15 — Deployment
  // ------------------------------------------------------------------
  sec(
    'Deployment',
    [
      top('Linux basics'),
      top('Environment configuration'),
      top('Docker'),
      top('Dockerfile'),
      top('Docker Compose'),
      top('PostgreSQL Docker'),
      top('Redis Docker'),
      top('Nginx'),
      top('Gunicorn/Uvicorn'),
      top('CI/CD'),
      top('GitHub Actions'),
      top('Cloud deployment'),
      top('Production environment'),
      top('Monitoring'),
      top('Health checks'),
    ],
    { description: 'Shipping and operating the backend with Docker, CI/CD and monitoring.' }
  ),

  // ------------------------------------------------------------------
  // Optional projects
  // ------------------------------------------------------------------
  sec(
    'Projects — Python',
    [
      top('CLI Calculator', { description: 'Build a terminal calculator with arithmetic evaluation and history.' }),
      top('File Organizer', { description: 'Auto-sort files in a directory by type using pathlib and shutil.' }),
      top('Expense Tracker', { description: 'A CLI app to add, list and summarize expenses from CSV/JSON storage.' }),
      top('Web Scraper', { description: 'Scrape and extract data from a website with requests and BeautifulSoup.' }),
      top('REST API', { description: 'A small REST API exposing your data with FastAPI or Flask.' }),
    ],
    { description: 'Optional hands-on Python projects — these do not count toward core progress.', optional: true }
  ),
  sec(
    'Projects — Backend',
    [
      top('Authentication API', { description: 'Full auth API with hashing, JWT access/refresh tokens and roles.' }),
      top('Blog API', { description: 'Blog backend with users, posts, comments and categories.' }),
      top('E-commerce API', { description: 'Products, carts, orders and payments for an e-commerce backend.' }),
      top('Task Management API', { description: 'Task CRUD with priorities, due dates and user assignments.' }),
      top('Real-time Chat API', { description: 'Chat backend using WebSockets with rooms and presence.' }),
    ],
    { description: 'Optional backend projects — these do not count toward core progress.', optional: true }
  ),
];

export const buildPythonBackendTemplate = () => ({
  title: 'Python Backend Development',
  icon: 'Server',
  subject: 'python',
  description:
    'The complete Python backend curriculum — fundamentals, data structures, OOP, FastAPI, databases, security, testing, production and deployment.',
  sections: pythonBackendSections,
});