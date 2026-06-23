export type Lesson = {
  id: string;
  title: string;
  content: string;
};

export type Topic = {
  id: string;
  name: string;
  icon: TopicIconName;
  color: string;
  lessons: Lesson[];
};

export type TopicIconName = 'cpu' | 'trending-up' | 'sigma';

export const TOPICS: Topic[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    icon: 'cpu',
    color: '#00ff88',
    lessons: [
      {
        id: 'cs-1',
        title: 'What is an Algorithm?',
        content:
          'An algorithm is a step-by-step set of instructions to solve a problem. Think of it like a recipe — precise steps that always produce the same result. Algorithms are the foundation of all computing.',
      },
      {
        id: 'cs-2',
        title: 'Data Structures Basics',
        content:
          'Data structures organize information efficiently. Arrays store items in order, linked lists connect nodes, trees branch hierarchically, and hash maps offer instant lookups. Choosing the right structure is key to performance.',
      },
      {
        id: 'cs-3',
        title: 'Big O Notation',
        content:
          'Big O describes how an algorithm scales. O(1) is constant time, O(n) is linear, O(n²) is quadratic. It helps you predict performance as data grows — essential for writing efficient code.',
      },
      {
        id: 'cs-4',
        title: 'How the Internet Works',
        content:
          'Data travels in packets across networks using TCP/IP. DNS translates domain names to IP addresses. HTTP defines how browsers and servers communicate. Together, they form the backbone of the web.',
      },
    ],
  },
  {
    id: 'econ',
    name: 'Economics',
    icon: 'trending-up',
    color: '#00b4d8',
    lessons: [
      {
        id: 'econ-1',
        title: 'Supply & Demand',
        content:
          'When demand exceeds supply, prices rise. When supply exceeds demand, prices fall. This equilibrium mechanism is the most fundamental concept in economics, governing everything from bread to housing.',
      },
      {
        id: 'econ-2',
        title: 'Opportunity Cost',
        content:
          'Every choice has a cost — what you give up. Studying economics tonight means not watching a movie. Governments face this too: spending on defense means less for healthcare. Thinking in trade-offs sharpens decisions.',
      },
      {
        id: 'econ-3',
        title: 'Inflation Explained',
        content:
          'Inflation is the general rise in prices over time. Moderate inflation (2-3%) is normal. Too much erodes purchasing power. Central banks use interest rates to keep it in check.',
      },
      {
        id: 'econ-4',
        title: 'GDP & Growth',
        content:
          "Gross Domestic Product measures total economic output. Growing GDP means more jobs and wealth. But GDP doesn't capture inequality, environment, or well-being — it's a useful but incomplete metric.",
      },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'sigma',
    color: '#a78bfa',
    lessons: [
      {
        id: 'math-1',
        title: 'Limits & Continuity',
        content:
          'A limit describes what a function approaches as input nears a value. Continuity means no jumps or holes. These concepts underpin calculus and help us handle infinity rigorously.',
      },
      {
        id: 'math-2',
        title: 'Probability Basics',
        content:
          "Probability quantifies uncertainty from 0 (impossible) to 1 (certain). Independent events multiply, dependent events use conditionals. Bayes' theorem lets us update beliefs with new evidence.",
      },
      {
        id: 'math-3',
        title: 'Linear Algebra Intro',
        content:
          'Vectors represent direction and magnitude. Matrices transform space. Eigenvalues reveal fundamental properties. Linear algebra powers machine learning, computer graphics, and quantum mechanics.',
      },
    ],
  },
];

export type ReviewCard = { q: string; a: string; w: string[] };

export const REVIEW_CARDS: Record<string, ReviewCard[]> = {
  'cs-1': [
    {
      q: 'What is an algorithm?',
      a: 'A step-by-step set of instructions',
      w: ['A type of programming language', 'A data storage method', 'A computer hardware component'],
    },
    {
      q: 'What does an algorithm produce?',
      a: 'The same result every time',
      w: ['Different results each time', 'Random outputs', 'Only correct answers'],
    },
    {
      q: 'What is an algorithm like?',
      a: 'A recipe',
      w: ['A book', 'A calculator', 'A map'],
    },
  ],
  'cs-2': [
    {
      q: 'What do data structures do?',
      a: 'Organize information efficiently',
      w: ['Store only numbers', 'Encrypt data', 'Delete unused data'],
    },
    {
      q: 'What is a hash map used for?',
      a: 'Instant lookups',
      w: ['Sorting data', 'Compressing files', 'Displaying graphics'],
    },
    {
      q: 'How do linked lists work?',
      a: 'Connect nodes together',
      w: ['Store data in rows', 'Use fixed memory', 'Prevent duplicates'],
    },
  ],
  'cs-3': [
    {
      q: 'What does O(1) mean?',
      a: 'Constant time',
      w: ['Linear time', 'Quadratic time', 'Exponential time'],
    },
    {
      q: 'What does Big O help with?',
      a: 'Predict algorithm performance',
      w: ['Measure memory usage', 'Compile code', 'Debug errors'],
    },
    {
      q: 'Is O(n²) faster than O(n)?',
      a: "No, it's slower",
      w: ["Yes, it's faster", 'They are equal', 'It depends on n'],
    },
  ],
  'cs-4': [
    {
      q: 'How does data travel on the internet?',
      a: 'In packets',
      w: ['In streams', 'In blocks', 'In waves'],
    },
    {
      q: 'What does DNS do?',
      a: 'Translates domain names to IP addresses',
      w: ['Encrypts messages', 'Sends emails', 'Compresses files'],
    },
    {
      q: 'What protocol defines browser-server communication?',
      a: 'HTTP',
      w: ['TCP', 'IP', 'DNS'],
    },
  ],
  'econ-1': [
    {
      q: 'What happens when demand exceeds supply?',
      a: 'Prices rise',
      w: ['Prices fall', 'Prices stay the same', 'Products disappear'],
    },
    {
      q: 'What is the equilibrium mechanism?',
      a: 'Price adjustment between supply and demand',
      w: ['Government control', 'Random chance', 'Consumer preference'],
    },
    {
      q: 'What governs most markets?',
      a: 'Supply and demand',
      w: ['Government alone', 'Technology', 'Random events'],
    },
  ],
  'econ-2': [
    {
      q: 'What is opportunity cost?',
      a: 'What you give up by choosing something',
      w: ['The price of an item', 'Money earned', 'Time wasted'],
    },
    {
      q: 'If you study tonight instead of watching a movie, what is the cost?',
      a: 'The movie',
      w: ['Your study time', 'Your money', 'Your energy'],
    },
    {
      q: 'Do governments face opportunity costs?',
      a: 'Yes, always',
      w: ['No, never', 'Only sometimes', 'Only during wars'],
    },
  ],
  'econ-3': [
    {
      q: 'What is inflation?',
      a: 'General rise in prices over time',
      w: ['Drop in prices', 'Stable prices', 'Currency strength'],
    },
    {
      q: 'Is moderate inflation normal?',
      a: 'Yes, 2-3% is normal',
      w: ['No, inflation is bad', 'It depends on the country', 'Inflation is always good'],
    },
    {
      q: 'Who controls inflation rates?',
      a: 'Central banks',
      w: ['Governments', 'Businesses', 'Consumers'],
    },
  ],
  'econ-4': [
    {
      q: 'What does GDP measure?',
      a: 'Total economic output',
      w: ['Population size', 'Average income', 'Unemployment rate'],
    },
    {
      q: 'Does growing GDP mean more jobs?',
      a: 'Usually yes',
      w: ['Never', 'Always', 'Only in rich countries'],
    },
    {
      q: "What doesn't GDP capture?",
      a: 'Inequality and environment',
      w: ['Employment', 'Production', 'Income'],
    },
  ],
  'math-1': [
    {
      q: 'What does a limit describe?',
      a: 'What a function approaches',
      w: ['Maximum value', 'Minimum value', 'Average value'],
    },
    {
      q: 'What does continuity mean?',
      a: 'No jumps or holes',
      w: ['Always increasing', 'Always positive', 'Always linear'],
    },
    {
      q: 'What do limits underpin?',
      a: 'Calculus',
      w: ['Geometry', 'Algebra', 'Statistics'],
    },
  ],
  'math-2': [
    {
      q: 'What range does probability cover?',
      a: '0 to 1',
      w: ['0 to 100', '1 to 10', '-1 to 1'],
    },
    {
      q: 'When events are independent, how do you find combined probability?',
      a: 'Multiply them',
      w: ['Add them', 'Divide them', 'Subtract them'],
    },
    {
      q: "What does Bayes' theorem allow?",
      a: 'Update beliefs with new evidence',
      w: ['Predict the future', 'Calculate averages', 'Find correlations'],
    },
  ],
  'math-3': [
    {
      q: 'What do vectors represent?',
      a: 'Direction and magnitude',
      w: ['Only numbers', 'Only coordinates', 'Only distances'],
    },
    {
      q: 'What do matrices do?',
      a: 'Transform space',
      w: ['Store numbers only', 'Sort data', 'Display images'],
    },
    {
      q: 'Where does linear algebra power innovation?',
      a: 'Machine learning and graphics',
      w: ['Database design', 'Web development', 'Mobile apps'],
    },
  ],
};

export const ALL_LESSONS = TOPICS.flatMap((t) =>
  t.lessons.map((l) => ({
    ...l,
    topicId: t.id,
    topicName: t.name,
    topicColor: t.color,
  })),
);
