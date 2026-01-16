export const courses = [
  {
    id: 'html',
    name: 'HTML',
    description: 'Learn the building blocks of web pages',
    icon: 'FaHtml5',
    color: '#e34c26',
    progress: 75,
    totalTopics: 20,
    completedTopics: 15,
    topics: [
      {
        id: 1,
        title: 'Introduction to HTML',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-intro.pdf',
        practice: [
          { id: 1, question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], answer: 0 },
          { id: 2, question: 'Who invented HTML?', options: ['Tim Berners-Lee', 'Bill Gates', 'Steve Jobs', 'Mark Zuckerberg'], answer: 0 },
          { id: 3, question: 'What is the correct file extension for HTML files?', options: ['.htm or .html', '.htl', '.ht', '.hml'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Create Your First HTML Page',
          description: 'Create a basic HTML page with a doctype declaration, html, head, and body tags.',
          starterCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <!-- Add your content here -->\n  </body>\n</html>'
        }
      },
      {
        id: 2,
        title: 'HTML Document Structure',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-structure.pdf',
        practice: [
          { id: 1, question: 'Which tag contains metadata about the HTML document?', options: ['<head>', '<body>', '<meta>', '<title>'], answer: 0 },
          { id: 2, question: 'What is the root element of an HTML page?', options: ['<html>', '<body>', '<head>', '<root>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Build Document Structure',
          description: 'Create an HTML document with proper structure including DOCTYPE, html, head with title, and body.',
          starterCode: '<!-- Create the complete HTML structure -->'
        }
      },
      {
        id: 3,
        title: 'Headings and Paragraphs',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-headings.pdf',
        practice: [
          { id: 1, question: 'How many heading levels are there in HTML?', options: ['6', '4', '3', '5'], answer: 0 },
          { id: 2, question: 'Which tag is used for paragraphs?', options: ['<p>', '<para>', '<paragraph>', '<text>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Create Headings',
          description: 'Create a page with all 6 heading levels and a paragraph under each.',
          starterCode: '<h1>Main Heading</h1>\n<p>Your paragraph here</p>'
        }
      },
      {
        id: 4,
        title: 'Text Formatting Tags',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-formatting.pdf',
        practice: [
          { id: 1, question: 'Which tag makes text bold?', options: ['<b> or <strong>', '<bold>', '<em>', '<i>'], answer: 0 },
          { id: 2, question: 'Which tag is used for italic text?', options: ['<i> or <em>', '<italic>', '<it>', '<slant>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Format Text',
          description: 'Create a paragraph with bold, italic, underlined, and strikethrough text.',
          starterCode: '<p>This is <strong>bold</strong> text.</p>'
        }
      },
      {
        id: 5,
        title: 'Links and Anchors',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-links.pdf',
        practice: [
          { id: 1, question: 'Which attribute specifies the URL in anchor tag?', options: ['href', 'src', 'link', 'url'], answer: 0 },
          { id: 2, question: 'How to open a link in a new tab?', options: ['target="_blank"', 'new="tab"', 'open="new"', 'tab="new"'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Create Links',
          description: 'Create links that open in the same tab and a new tab.',
          starterCode: '<a href="https://example.com">Click Here</a>'
        }
      },
      {
        id: 6,
        title: 'Images and Media',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-images.pdf',
        practice: [
          { id: 1, question: 'Which attribute specifies the image source?', options: ['src', 'href', 'link', 'source'], answer: 0 },
          { id: 2, question: 'What attribute provides alternative text for images?', options: ['alt', 'title', 'text', 'desc'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Add Images',
          description: 'Add an image with proper src and alt attributes.',
          starterCode: '<img src="" alt="" />'
        }
      },
      {
        id: 7,
        title: 'Lists - Ordered & Unordered',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-lists.pdf',
        practice: [
          { id: 1, question: 'Which tag creates an unordered list?', options: ['<ul>', '<ol>', '<li>', '<list>'], answer: 0 },
          { id: 2, question: 'Which tag is used for list items?', options: ['<li>', '<item>', '<list>', '<it>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Create Lists',
          description: 'Create both ordered and unordered lists with at least 3 items each.',
          starterCode: '<ul>\n  <li>Item 1</li>\n</ul>'
        }
      },
      {
        id: 8,
        title: 'HTML Tables',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-tables.pdf',
        practice: [
          { id: 1, question: 'Which tag defines a table row?', options: ['<tr>', '<td>', '<th>', '<row>'], answer: 0 },
          { id: 2, question: 'Which tag defines a table header cell?', options: ['<th>', '<thead>', '<header>', '<hd>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Build a Table',
          description: 'Create a table with headers and at least 3 rows of data.',
          starterCode: '<table>\n  <tr>\n    <th>Header</th>\n  </tr>\n</table>'
        }
      },
      {
        id: 9,
        title: 'Forms Basics',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-forms.pdf',
        practice: [
          { id: 1, question: 'Which tag is used to create a form?', options: ['<form>', '<input>', '<submit>', '<field>'], answer: 0 },
          { id: 2, question: 'Which attribute specifies where form data is sent?', options: ['action', 'method', 'target', 'submit'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Create a Form',
          description: 'Create a basic contact form with name, email, and message fields.',
          starterCode: '<form action="/submit" method="POST">\n  <!-- Add form fields -->\n</form>'
        }
      },
      {
        id: 10,
        title: 'Form Input Types',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-inputs.pdf',
        practice: [
          { id: 1, question: 'Which input type creates a password field?', options: ['password', 'secret', 'hidden', 'secure'], answer: 0 },
          { id: 2, question: 'Which input type creates a checkbox?', options: ['checkbox', 'check', 'tick', 'box'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Input Types',
          description: 'Create a form with text, email, password, checkbox, and radio inputs.',
          starterCode: '<input type="text" name="username" />'
        }
      },
      {
        id: 11,
        title: 'Form Validation',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-validation.pdf',
        practice: [
          { id: 1, question: 'Which attribute makes a field required?', options: ['required', 'mandatory', 'needed', 'must'], answer: 0 },
          { id: 2, question: 'Which attribute sets minimum length?', options: ['minlength', 'min', 'length', 'minchar'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Form Validation',
          description: 'Create a form with validation: required fields, min/max length, and pattern.',
          starterCode: '<input type="text" required minlength="3" />'
        }
      },
      {
        id: 12,
        title: 'Semantic HTML',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-semantic.pdf',
        practice: [
          { id: 1, question: 'Which tag represents the main content?', options: ['<main>', '<content>', '<body>', '<primary>'], answer: 0 },
          { id: 2, question: 'Which tag represents a navigation section?', options: ['<nav>', '<navigation>', '<menu>', '<links>'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Semantic Layout',
          description: 'Create a page using semantic tags: header, nav, main, article, aside, footer.',
          starterCode: '<header>\n  <!-- Navigation here -->\n</header>\n<main>\n  <!-- Main content -->\n</main>'
        }
      },
      {
        id: 13,
        title: 'HTML5 New Elements',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html5-elements.pdf',
        practice: [
          { id: 1, question: 'Which HTML5 tag is used for graphics?', options: ['<canvas>', '<draw>', '<graphics>', '<svg>'], answer: 0 },
          { id: 2, question: 'Which tag is used for date input?', options: ['<input type="date">', '<date>', '<calendar>', '<input type="calendar">'], answer: 0 }
        ],
        codingAssessment: {
          title: 'HTML5 Features',
          description: 'Use HTML5 elements: figure, figcaption, details, summary, and progress.',
          starterCode: '<figure>\n  <img src="image.jpg" alt="Description">\n  <figcaption>Caption</figcaption>\n</figure>'
        }
      },
      {
        id: 14,
        title: 'Audio and Video',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-media.pdf',
        practice: [
          { id: 1, question: 'Which attribute adds playback controls?', options: ['controls', 'player', 'control', 'play'], answer: 0 },
          { id: 2, question: 'Which attribute makes media loop?', options: ['loop', 'repeat', 'cycle', 'auto'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Embed Media',
          description: 'Add audio and video elements with controls.',
          starterCode: '<video src="video.mp4" controls>\n  Your browser does not support video.\n</video>'
        }
      },
      {
        id: 15,
        title: 'iFrames',
        completed: true,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-iframes.pdf',
        practice: [
          { id: 1, question: 'What does iframe stand for?', options: ['Inline Frame', 'Internal Frame', 'Internet Frame', 'Input Frame'], answer: 0 },
          { id: 2, question: 'Which attribute sets iframe dimensions?', options: ['width and height', 'size', 'dimension', 'scale'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Embed Content',
          description: 'Embed a YouTube video using an iframe.',
          starterCode: '<iframe src="" width="560" height="315"></iframe>'
        }
      },
      {
        id: 16,
        title: 'Meta Tags and SEO',
        completed: false,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-meta.pdf',
        practice: [
          { id: 1, question: 'Which meta tag sets character encoding?', options: ['charset', 'encoding', 'character', 'code'], answer: 0 },
          { id: 2, question: 'Which meta tag helps with SEO?', options: ['description', 'seo', 'keywords', 'search'], answer: 0 }
        ],
        codingAssessment: {
          title: 'SEO Meta Tags',
          description: 'Add meta tags for description, keywords, viewport, and author.',
          starterCode: '<head>\n  <meta charset="UTF-8">\n  <!-- Add more meta tags -->\n</head>'
        }
      },
      {
        id: 17,
        title: 'HTML Entities',
        completed: false,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-entities.pdf',
        practice: [
          { id: 1, question: 'What entity represents a space?', options: ['&nbsp;', '&space;', '&sp;', '&blank;'], answer: 0 },
          { id: 2, question: 'What entity represents < symbol?', options: ['&lt;', '&less;', '&left;', '&l;'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Use Entities',
          description: 'Display special characters using HTML entities.',
          starterCode: '<p>Less than: &lt; Greater than: &gt;</p>'
        }
      },
      {
        id: 18,
        title: 'HTML Comments',
        completed: false,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-comments.pdf',
        practice: [
          { id: 1, question: 'How do you write a comment in HTML?', options: ['<!-- comment -->', '// comment', '/* comment */', '# comment'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Add Comments',
          description: 'Add meaningful comments to explain sections of your HTML code.',
          starterCode: '<!-- This is a comment -->\n<p>Visible content</p>'
        }
      },
      {
        id: 19,
        title: 'Accessibility (a11y)',
        completed: false,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-a11y.pdf',
        practice: [
          { id: 1, question: 'What attribute provides accessible names?', options: ['aria-label', 'title', 'name', 'label'], answer: 0 },
          { id: 2, question: 'Which attribute describes an element?', options: ['aria-describedby', 'description', 'desc', 'aria-desc'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Make It Accessible',
          description: 'Add ARIA attributes to make a navigation menu accessible.',
          starterCode: '<nav aria-label="Main Navigation">\n  <!-- Add accessible menu -->\n</nav>'
        }
      },
      {
        id: 20,
        title: 'HTML Best Practices',
        completed: false,
        video: 'https://www.youtube.com/embed/qz0aGYrrlhU',
        ppt: '/assets/ppts/html-best.pdf',
        practice: [
          { id: 1, question: 'Should you always close HTML tags?', options: ['Yes', 'No', 'Sometimes', 'Only for div'], answer: 0 },
          { id: 2, question: 'Is HTML case sensitive?', options: ['No', 'Yes', 'Only for attributes', 'Only for tags'], answer: 0 }
        ],
        codingAssessment: {
          title: 'Clean HTML',
          description: 'Refactor messy HTML to follow best practices.',
          starterCode: '<!-- Clean up this HTML -->\n<DIV><P>Hello World'
        }
      }
    ]
  },
  {
    id: 'css',
    name: 'CSS',
    description: 'Style your web pages beautifully',
    icon: 'FaCss3Alt',
    color: '#264de4',
    progress: 60,
    totalTopics: 25,
    completedTopics: 15,
    topics: [
      { id: 1, title: 'Introduction to CSS', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Basic Styling', description: 'Add CSS to style a paragraph', starterCode: 'p { color: blue; }' } },
      { id: 2, title: 'CSS Selectors', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Selectors', description: 'Use different CSS selectors', starterCode: '' } },
      { id: 3, title: 'Colors and Backgrounds', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Colors', description: 'Apply colors and backgrounds', starterCode: '' } },
      { id: 4, title: 'Box Model', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Box Model', description: 'Understand margins and padding', starterCode: '' } },
      { id: 5, title: 'Typography', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Fonts', description: 'Style text with fonts', starterCode: '' } }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'Add interactivity to your websites',
    icon: 'FaJs',
    color: '#f7df1e',
    progress: 40,
    totalTopics: 30,
    completedTopics: 12,
    topics: [
      { id: 1, title: 'Introduction to JavaScript', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Hello World', description: 'Write your first JS', starterCode: 'console.log("Hello World");' } },
      { id: 2, title: 'Variables and Data Types', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Variables', description: 'Declare variables', starterCode: '' } },
      { id: 3, title: 'Operators', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Math', description: 'Use operators', starterCode: '' } },
      { id: 4, title: 'Functions', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Functions', description: 'Create functions', starterCode: '' } },
      { id: 5, title: 'Arrays', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Arrays', description: 'Work with arrays', starterCode: '' } }
    ]
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Server-side JavaScript runtime',
    icon: 'FaNodeJs',
    color: '#68a063',
    progress: 20,
    totalTopics: 20,
    completedTopics: 4,
    topics: [
      { id: 1, title: 'Introduction to Node.js', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Node Basics', description: 'Run Node.js', starterCode: '' } },
      { id: 2, title: 'NPM Basics', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'NPM', description: 'Use npm commands', starterCode: '' } },
      { id: 3, title: 'File System', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'FS Module', description: 'Read and write files', starterCode: '' } }
    ]
  },
  {
    id: 'express',
    name: 'Express.js',
    description: 'Fast, minimalist web framework',
    icon: 'SiExpress',
    color: '#ffffff',
    progress: 0,
    totalTopics: 15,
    completedTopics: 0,
    topics: [
      { id: 1, title: 'Introduction to Express', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Express Setup', description: 'Create Express app', starterCode: '' } },
      { id: 2, title: 'Routing', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Routes', description: 'Create routes', starterCode: '' } },
      { id: 3, title: 'Middleware', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Middleware', description: 'Use middleware', starterCode: '' } }
    ]
  },
  {
    id: 'react',
    name: 'React',
    description: 'Build modern user interfaces',
    icon: 'FaReact',
    color: '#61dafb',
    progress: 10,
    totalTopics: 25,
    completedTopics: 2,
    topics: [
      { id: 1, title: 'Introduction to React', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'React Basics', description: 'Create React component', starterCode: '' } },
      { id: 2, title: 'JSX', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'JSX', description: 'Use JSX syntax', starterCode: '' } },
      { id: 3, title: 'Components', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Components', description: 'Build components', starterCode: '' } },
      { id: 4, title: 'Props', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Props', description: 'Pass props', starterCode: '' } },
      { id: 5, title: 'State', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'State', description: 'Manage state', starterCode: '' } }
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'NoSQL database for modern apps',
    icon: 'SiMongodb',
    color: '#47a248',
    progress: 5,
    totalTopics: 18,
    completedTopics: 1,
    topics: [
      { id: 1, title: 'Introduction to MongoDB', completed: true, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'MongoDB Basics', description: 'Connect to MongoDB', starterCode: '' } },
      { id: 2, title: 'CRUD Operations', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'CRUD', description: 'Perform CRUD', starterCode: '' } },
      { id: 3, title: 'Mongoose', completed: false, video: 'https://www.youtube.com/embed/qz0aGYrrlhU', ppt: '', practice: [], codingAssessment: { title: 'Mongoose', description: 'Use Mongoose', starterCode: '' } }
    ]
  }
];

export const dashboardStats = {
  coursesEnrolled: 7,
  totalProgress: 35,
  hoursLearned: 48,
  certificatesEarned: 1,
  streakDays: 12,
  assignmentsCompleted: 23
};

export const recentActivity = [
  { id: 1, type: 'video', course: 'HTML', topic: 'Forms and Inputs', time: '2 hours ago' },
  { id: 2, type: 'quiz', course: 'CSS', topic: 'Flexbox Layout', time: '1 day ago' },
  { id: 3, type: 'code', course: 'JavaScript', topic: 'Array Methods', time: '2 days ago' },
  { id: 4, type: 'video', course: 'React', topic: 'Introduction to React', time: '3 days ago' },
  { id: 5, type: 'quiz', course: 'HTML', topic: 'Semantic HTML', time: '4 days ago' }
];
