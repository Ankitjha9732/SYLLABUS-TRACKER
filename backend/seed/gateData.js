/**
 * GATE CS 2027 syllabus (subject: 'gate').
 * Aligned to the official GATE 2027 CS Syllabus (IIT Madras).
 * Section → Topic hierarchy (no subtopics), matching the MERN/DSA pattern.
 *
 * Structure:
 *   10 core sections covering all GATE CS subjects
 *   1 optional section for General Aptitude (does not count toward progress)
 */

const sec = (title, topics, { description = '', optional = false } = {}) => ({
  title,
  description,
  optional,
  topics,
});

const t = (title, description = '') => ({ title, description });

export const gateSections = [
  // ---------------------------------------------------------------
  // Section 1 — Digital Logic
  // ---------------------------------------------------------------
  sec('Digital Logic', [
    t('Boolean Algebra & Minimization', 'Algebraic technique, K-maps, tabular (Quine-McCluskey) method'),
    t('Combinational Circuit Design', 'Adders, multiplexers, decoders'),
    t('Sequential Circuit Design', 'Flip-flops, counters, registers'),
    t('Number Representation & Arithmetic', 'Fixed point and floating point representation'),
  ], { description: 'Boolean algebra, combinational and sequential circuits, number systems.' }),

  // ---------------------------------------------------------------
  // Section 2 — Programming & Data Structures
  // ---------------------------------------------------------------
  sec('Programming & Data Structures', [
    t('Programming in C & Recursion', 'C language basics, recursive problem solving'),
    t('Arrays, Stacks, Queues', 'Linear data structures and their applications'),
    t('Linked Lists', 'Singly and doubly linked lists, operations and traversal'),
    t('Trees & Binary Search Trees', 'Tree traversals, BST operations'),
    t('Binary Heaps', 'Heap property, heap operations, priority queues'),
    t('Graphs — Representations & Traversals', 'Adjacency list/matrix, BFS and DFS'),
  ], { description: 'Core programming concepts and fundamental data structures.' }),

  // ---------------------------------------------------------------
  // Section 3 — Engineering Mathematics (Discrete Math)
  // ---------------------------------------------------------------
  sec('Engineering Mathematics — Discrete Math', [
    t('Propositional & First-Order Logic', 'Logical connectives, equivalences, predicates, quantifiers'),
    t('Sets, Relations & Functions', 'Set operations, equivalence relations, partial orders'),
    t('Partial Orders & Lattices', 'Hasse diagrams, lattice properties'),
    t('Monoids & Groups', 'Group axioms, subgroups, cosets, Lagrange\'s theorem'),
    t('Graph Theory — Connectivity, Matching, Colouring', 'Graph connectivity, vertex cover, graph colouring'),
    t('Combinatorics', 'Counting principles, permutations, combinations'),
    t('Recurrence Relations & Generating Functions', 'Linear recurrences, solving via generating functions'),
  ], { description: 'Discrete mathematics foundations for computer science.' }),

  // ---------------------------------------------------------------
  // Section 4 — Computer Organization & Architecture
  // ---------------------------------------------------------------
  sec('Computer Organization & Architecture', [
    t('Instruction Set & Addressing Modes', 'ISA design, addressing modes'),
    t('ALU Design', 'Arithmetic logic unit design and operations'),
    t('Control Unit Design', 'Hardwired and microprogrammed control'),
    t('Instruction Pipelining & Hazards', 'Pipeline stages, data/control/structural hazards'),
    t('Memory Hierarchy & Cache', 'Cache mapping techniques, performance, memory interfacing'),
    t('I/O Interface', 'Interrupt-driven I/O, DMA'),
  ], { description: 'Computer architecture, pipelining, memory and I/O systems.' }),

  // ---------------------------------------------------------------
  // Section 5 — Algorithms
  // ---------------------------------------------------------------
  sec('Algorithms', [
    t('Asymptotic Analysis & Recurrences', 'Time/space complexity, Master theorem'),
    t('Searching, Sorting & Hashing', 'Linear/binary search, comparison sorts, hash tables'),
    t('Greedy Algorithms', 'Activity selection, Huffman coding, Kruskal/Prim'),
    t('Dynamic Programming', 'Optimal substructure, memoization, tabulation'),
    t('Divide & Conquer', 'Merge sort, quick sort, close pair of points'),
    t('Graph Algorithms — Traversals, MST, Shortest Paths', 'BFS/DFS, Dijkstra, Bellman-Ford, Floyd-Warshall'),
  ], { description: 'Algorithm design paradigms, complexity analysis and graph algorithms.' }),

  // ---------------------------------------------------------------
  // Section 6 — Operating Systems
  // ---------------------------------------------------------------
  sec('Operating Systems', [
    t('Processes, Threads & IPC', 'Process states, threads, inter-process communication'),
    t('Concurrency & Synchronization', 'Mutex, semaphore, monitors, critical section'),
    t('CPU Scheduling', 'Scheduling algorithms, convoy effect, response time'),
    t('Deadlocks', 'Detection, prevention, avoidance, recovery'),
    t('Memory Management & Virtual Memory', 'Paging, segmentation, page replacement algorithms'),
    t('I/O Scheduling & File Systems', 'Disk scheduling, file system structures'),
  ], { description: 'Process management, memory management, concurrency and file systems.' }),

  // ---------------------------------------------------------------
  // Section 7 — Databases
  // ---------------------------------------------------------------
  sec('Databases', [
    t('ER Model & Relational Model', 'Entity-relationship diagrams, relational algebra, tuple calculus'),
    t('SQL', 'Queries, subqueries, joins, views, aggregation'),
    t('Integrity Constraints & Normal Forms', 'Keys, foreign keys, functional dependencies, 1NF-BCNF'),
    t('File Organization & Indexing', 'Sequential, clustered, B and B+ trees'),
    t('Transactions & Concurrency Control', 'ACID properties, serializability, 2PL, timestamp protocols'),
  ], { description: 'Relational databases, SQL, normalization and transaction management.' }),

  // ---------------------------------------------------------------
  // Section 8 — Computer Networks
  // ---------------------------------------------------------------
  sec('Computer Networks', [
    t('Layering Principles & Switching', 'OSI/TCP-IP models, circuit/packet/virtual circuit switching'),
    t('Data Link Layer', 'Error detection, MAC protocols, Ethernet'),
    t('Routing — Distance Vector & Link State', 'RIP, OSPF, path vector'),
    t('IPv4 — Fragmentation, CIDR & NAT', 'IP addressing, subnetting, NAT traversal'),
    t('TCP — Flow Control & Congestion Control', 'Sliding window,慢启动, AIMD, socket API'),
    t('DNS & HTTP', 'Domain name system, HTTP/HTTPS protocols'),
  ], { description: 'Network layering, routing, transport protocols and application layer.' }),

  // ---------------------------------------------------------------
  // Section 9 — Theory of Computation
  // ---------------------------------------------------------------
  sec('Theory of Computation', [
    t('Regular Expressions & Finite Automata', 'DFA, NFA, equivalence of RE and FA'),
    t('Context-Free Gramars & Pushdown Automata', 'CFG derivation, PDA, CFL properties'),
    t('Pumping Lemma', 'For regular and context-free languages'),
    t('Turing Machines & Undecidability', 'TM model, halting problem, undecidable languages'),
  ], { description: 'Automata theory, formal languages and computability.' }),

  // ---------------------------------------------------------------
  // Section 10 — Compiler Design
  // ---------------------------------------------------------------
  sec('Compiler Design', [
    t('Lexical Analysis & Parsing', 'Tokens, lexical analysis, top-down and bottom-up parsing'),
    t('Syntax-Directed Translation', 'SDT, inherited and synthesized attributes'),
    t('Runtime Environments', 'Stack allocation, heap management'),
    t('Intermediate Code Generation', 'Three-address code, quadruples, triples'),
    t('Code Optimization', 'Local optimization, constant propagation, liveness analysis, common sub-expression elimination'),
  ], { description: 'Compiler construction phases from lexical analysis to code optimization.' }),

  // ---------------------------------------------------------------
  // Section 11 — Engineering Mathematics (Linear Algebra, Calculus, Probability)
  // ---------------------------------------------------------------
  sec('Engineering Mathematics — Linear Algebra, Calculus & Probability', [
    t('Matrices & Determinants', 'Matrix operations, determinants, system of linear equations'),
    t('Eigenvalues & Eigenvectors', 'Characteristic equation, diagonalization, LU decomposition'),
    t('Limits, Continuity & Differentiability', 'Limit evaluation, continuity tests, differentiability'),
    t('Maxima & Minima', 'Local and global extrema, Mean Value Theorem'),
    t('Integration', 'Definite and indefinite integrals, applications'),
    t('Probability & Statistics', 'Random variables, distributions (uniform, normal, exponential, Poisson, binomial), mean/median/mode, conditional probability, Bayes\' theorem'),
  ], { description: 'Linear algebra, calculus and probability for GATE CS.' }),
];

export const gateOptionalSections = [
  sec('General Aptitude', [
    t('Verbal Reasoning', 'Reading comprehension, verbal ability, critical reasoning'),
    t('Quantitative Reasoning', 'Numerical ability, data interpretation, mathematical reasoning'),
  ], { description: 'General Aptitude — worth 15% of total marks. High ROI for prep time.', optional: true }),
];

export const buildGateTemplate = () => ({
  title: 'GATE CS 2027',
  icon: 'GraduationCap',
  subject: 'gate',
  description: 'GATE Computer Science & Information Technology 2027 — complete syllabus aligned to IIT Madras official pattern.',
  sections: [...gateSections, ...gateOptionalSections],
});
