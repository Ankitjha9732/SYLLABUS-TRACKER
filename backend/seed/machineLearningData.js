/**
 * Machine Learning syllabus (subject: 'ml').
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

export const machineLearningSections = [
  // ------------------------------------------------------------------
  // Module 1 — Python for Machine Learning
  // ------------------------------------------------------------------
  sec(
    'Python for Machine Learning',
    [
      top('NumPy', [
        st('Arrays', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Dimensions', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Shape', { difficulty: 'easy', estimatedTime: '15 min' }),
        st('Indexing', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Slicing', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Reshaping', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Broadcasting', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('Vectorization', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Mathematical operations', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Statistical operations', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Pandas', [
        st('Series', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('DataFrames', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('CSV', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('JSON', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Excel', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Data selection', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Filtering', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Sorting', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('GroupBy', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Merge', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('Join', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('Missing values', { difficulty: 'medium', estimatedTime: '40 min' }),
        st('Duplicates', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Data cleaning', { difficulty: 'medium', estimatedTime: '45 min' }),
      ]),
      top('Matplotlib', [
        st('Line plots', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Bar plots', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Scatter plots', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Histograms', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Box plots', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
      top('Seaborn', [
        st('Distribution plots', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Categorical plots', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Correlation heatmaps', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
    ],
    { description: 'NumPy, pandas, Matplotlib and Seaborn for data analysis and visualization.' }
  ),

  // ------------------------------------------------------------------
  // Module 2 — Mathematics for Machine Learning
  // ------------------------------------------------------------------
  sec(
    'Mathematics for Machine Learning',
    [
      top('Basic algebra'),
      top('Functions'),
      top('Exponents'),
      top('Logarithms'),
      top('Probability'),
      top('Conditional probability'),
      top('Bayes theorem'),
      top('Random variables'),
      top('Probability distributions'),
      top('Mean'),
      top('Median'),
      top('Mode'),
      top('Variance'),
      top('Standard deviation'),
      top('Covariance'),
      top('Correlation'),
      top('Linear Algebra', [
        st('Scalars', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Vectors', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Matrices', { difficulty: 'medium', estimatedTime: '40 min' }),
        st('Matrix operations', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Matrix multiplication', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Transpose', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Inverse', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Determinant', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Eigenvalues', { difficulty: 'hard', estimatedTime: '60 min' }),
        st('Eigenvectors', { difficulty: 'hard', estimatedTime: '60 min' }),
      ]),
      top('Calculus', [
        st('Limits', { difficulty: 'medium', estimatedTime: '40 min' }),
        st('Derivatives', { difficulty: 'medium', estimatedTime: '45 min' }),
        st('Partial derivatives', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('Gradients', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('Gradient descent', { difficulty: 'hard', estimatedTime: '60 min' }),
        st('Chain rule', { difficulty: 'hard', estimatedTime: '40 min' }),
      ]),
    ],
    { description: 'Probability, statistics, linear algebra and calculus needed for ML.' }
  ),

  // ------------------------------------------------------------------
  // Module 3 — Machine Learning Fundamentals
  // ------------------------------------------------------------------
  sec(
    'Machine Learning Fundamentals',
    [
      top('What is Machine Learning?'),
      top('AI vs ML vs Deep Learning'),
      top('Types of Machine Learning'),
      top('Supervised learning'),
      top('Unsupervised learning'),
      top('Semi-supervised learning'),
      top('Reinforcement learning'),
      top('Features'),
      top('Labels'),
      top('Training data'),
      top('Validation data'),
      top('Test data'),
      top('Model'),
      top('Parameters'),
      top('Hyperparameters'),
    ],
    { description: 'Core concepts — types of ML, data splits and model terminology.' }
  ),

  // ------------------------------------------------------------------
  // Module 4 — Data Preprocessing
  // ------------------------------------------------------------------
  sec(
    'Data Preprocessing',
    [
      top('Data collection'),
      top('Data exploration'),
      top('EDA'),
      top('Missing values'),
      top('Duplicate values'),
      top('Outliers'),
      top('Encoding categorical variables'),
      top('Label encoding'),
      top('One-hot encoding'),
      top('Feature scaling'),
      top('Standardization'),
      top('Normalization'),
      top('Feature selection'),
      top('Feature engineering'),
      top('Train/test split'),
      top('Cross-validation'),
      top('Data leakage'),
    ],
    { description: 'Cleaning, transforming and splitting data so models learn correctly.' }
  ),

  // ------------------------------------------------------------------
  // Module 5 — Regression
  // ------------------------------------------------------------------
  sec(
    'Regression',
    [
      top('Linear Regression'),
      top('Multiple Linear Regression'),
      top('Polynomial Regression'),
      top('Ridge Regression'),
      top('Lasso Regression'),
      top('Elastic Net'),
      top('Regression assumptions'),
      top('Regression Evaluation Metrics', [
        st('MAE', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('MSE', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('RMSE', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('R-squared', { difficulty: 'medium', estimatedTime: '40 min' }),
        st('Adjusted R-squared', { difficulty: 'hard', estimatedTime: '40 min' }),
      ]),
    ],
    { description: 'Predicting continuous targets from linear to regularized regression.' }
  ),

  // ------------------------------------------------------------------
  // Module 6 — Classification
  // ------------------------------------------------------------------
  sec(
    'Classification',
    [
      top('Logistic Regression'),
      top('K-Nearest Neighbors'),
      top('Naive Bayes'),
      top('Decision Trees'),
      top('Random Forest'),
      top('Support Vector Machines'),
      top('Gradient Boosting'),
      top('AdaBoost'),
      top('XGBoost'),
      top('LightGBM'),
      top('CatBoost'),
      top('Classification Evaluation Metrics', [
        st('Accuracy', { difficulty: 'easy', estimatedTime: '20 min' }),
        st('Precision', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Recall', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('F1-score', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Confusion Matrix', { difficulty: 'easy', estimatedTime: '30 min' }),
        st('ROC Curve', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('ROC-AUC', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('PR-AUC', { difficulty: 'hard', estimatedTime: '45 min' }),
      ]),
    ],
    { description: 'Predicting categories with classic ML classifiers and their metrics.' }
  ),

  // ------------------------------------------------------------------
  // Module 7 — Clustering
  // ------------------------------------------------------------------
  sec(
    'Clustering',
    [
      top('K-Means'),
      top('Hierarchical clustering'),
      top('DBSCAN'),
      top('Gaussian Mixture Models'),
      top('Clustering Evaluation', [
        st('Silhouette score', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('Elbow method', { difficulty: 'medium', estimatedTime: '30 min' }),
      ]),
    ],
    { description: 'Grouping unlabeled data and choosing the right number of clusters.' }
  ),

  // ------------------------------------------------------------------
  // Module 8 — Dimensionality Reduction
  // ------------------------------------------------------------------
  sec(
    'Dimensionality Reduction',
    [
      top('Curse of dimensionality'),
      top('PCA'),
      top('LDA'),
      top('t-SNE'),
      top('UMAP'),
    ],
    { description: 'Reducing features while preserving the structure of the data.' }
  ),

  // ------------------------------------------------------------------
  // Module 9 — Ensemble Learning
  // ------------------------------------------------------------------
  sec(
    'Ensemble Learning',
    [
      top('Voting'),
      top('Bagging'),
      top('Boosting'),
      top('Random Forest'),
      top('AdaBoost'),
      top('Gradient Boosting'),
      top('XGBoost'),
      top('Stacking'),
      top('Blending'),
    ],
    { description: 'Combining weak learners into strong, robust models.' }
  ),

  // ------------------------------------------------------------------
  // Module 10 — Model Selection and Optimization
  // ------------------------------------------------------------------
  sec(
    'Model Selection and Optimization',
    [
      top('Cross-validation'),
      top('GridSearchCV'),
      top('RandomizedSearchCV'),
      top('Hyperparameter tuning'),
      top('Bias'),
      top('Variance'),
      top('Bias-variance tradeoff'),
      top('Overfitting'),
      top('Underfitting'),
      top('Regularization'),
      top('Feature selection'),
      top('Pipelines'),
    ],
    { description: 'Choosing and tuning models to generalize well beyond training data.' }
  ),

  // ------------------------------------------------------------------
  // Module 11 — Feature Engineering
  // ------------------------------------------------------------------
  sec(
    'Feature Engineering',
    [
      top('Numerical features'),
      top('Categorical features'),
      top('Date/time features'),
      top('Text features'),
      top('Interaction features'),
      top('Polynomial features'),
      top('Feature transformations'),
      top('Feature importance'),
    ],
    { description: 'Creating and transforming features to improve model performance.' }
  ),

  // ------------------------------------------------------------------
  // Module 12 — Time Series
  // ------------------------------------------------------------------
  sec(
    'Time Series',
    [
      top('Time-series fundamentals'),
      top('Trends'),
      top('Seasonality'),
      top('Stationarity'),
      top('Autocorrelation'),
      top('Moving averages'),
      top('ARIMA'),
      top('SARIMA'),
      top('Forecasting'),
      top('Time-series validation'),
    ],
    { description: 'Analyzing and forecasting data indexed in time order.' }
  ),

  // ------------------------------------------------------------------
  // Module 13 — Natural Language Processing
  // ------------------------------------------------------------------
  sec(
    'Natural Language Processing',
    [
      top('NLP fundamentals'),
      top('Text preprocessing'),
      top('Tokenization'),
      top('Stop words'),
      top('Stemming'),
      top('Lemmatization'),
      top('Bag of Words'),
      top('TF-IDF'),
      top('N-grams'),
      top('Word embeddings'),
      top('Word2Vec'),
      top('GloVe'),
      top('Text classification'),
      top('Sentiment analysis'),
    ],
    { description: 'Working with text data — preprocessing, embeddings and classification.' }
  ),

  // ------------------------------------------------------------------
  // Module 14 — Deep Learning Fundamentals
  // ------------------------------------------------------------------
  sec(
    'Deep Learning Fundamentals',
    [
      top('Neural networks'),
      top('Perceptron'),
      top('Architecture'),
      top('Input layer'),
      top('Hidden layers'),
      top('Output layer'),
      top('Weights'),
      top('Bias'),
      top('Activation functions'),
      top('Sigmoid'),
      top('Tanh'),
      top('ReLU'),
      top('Softmax'),
      top('Loss functions'),
      top('Forward propagation'),
      top('Backpropagation'),
      top('Gradient descent'),
      top('SGD'),
      top('Adam'),
      top('Batch size'),
      top('Epochs'),
      top('Learning rate'),
    ],
    { description: 'How neural networks learn — layers, activations and optimization.' }
  ),

  // ------------------------------------------------------------------
  // Module 15 — PyTorch
  // ------------------------------------------------------------------
  sec(
    'PyTorch',
    [
      top('PyTorch installation'),
      top('Tensors'),
      top('Tensor operations'),
      top('Autograd'),
      top('Datasets'),
      top('DataLoaders'),
      top('Neural network modules'),
      top('Training loops'),
      top('Validation loops'),
      top('Optimizers'),
      top('Loss functions'),
      top('GPU/CUDA'),
      top('Saving/loading models'),
    ],
    { description: 'Building and training deep learning models with PyTorch.' }
  ),

  // ------------------------------------------------------------------
  // Module 16 — Computer Vision
  // ------------------------------------------------------------------
  sec(
    'Computer Vision',
    [
      top('Image fundamentals'),
      top('Image preprocessing'),
      top('OpenCV'),
      top('CNN'),
      top('Convolution'),
      top('Pooling'),
      top('Padding'),
      top('Stride'),
      top('Image classification'),
      top('Object detection'),
      top('Transfer learning'),
      top('Data augmentation'),
      top('Classic CNN Architectures', [
        st('LeNet', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('AlexNet', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('VGG', { difficulty: 'medium', estimatedTime: '30 min' }),
        st('ResNet', { difficulty: 'hard', estimatedTime: '45 min' }),
        st('YOLO basics', { difficulty: 'hard', estimatedTime: '45 min' }),
      ]),
    ],
    { description: 'Teaching machines to see — CNNs, detection and transfer learning.' }
  ),

  // ------------------------------------------------------------------
  // Module 17 — Advanced Deep Learning
  // ------------------------------------------------------------------
  sec(
    'Advanced Deep Learning',
    [
      top('CNN architectures'),
      top('RNN'),
      top('LSTM'),
      top('GRU'),
      top('Sequence-to-sequence'),
      top('Attention mechanism'),
      top('Transformers'),
      top('Encoder/decoder architecture'),
      top('Transfer learning'),
      top('Fine-tuning'),
    ],
    { description: 'Sequential and attention-based models for complex data.' }
  ),

  // ------------------------------------------------------------------
  // Module 18 — Generative AI
  // ------------------------------------------------------------------
  sec(
    'Generative AI',
    [
      top('LLM fundamentals'),
      top('Tokens'),
      top('Tokenization'),
      top('Embeddings'),
      top('Transformers'),
      top('Attention'),
      top('Prompt engineering'),
      top('Hugging Face'),
      top('Open-source LLMs'),
      top('Model inference'),
      top('Fine-tuning basics'),
      top('RAG'),
      top('Vector databases'),
      top('Semantic search'),
      top('AI agents fundamentals'),
    ],
    { description: 'Large language models, prompting, retrieval-augmented generation and agents.' }
  ),

  // ------------------------------------------------------------------
  // Module 19 — ML Model Deployment
  // ------------------------------------------------------------------
  sec(
    'ML Model Deployment',
    [
      top('Saving models'),
      top('Pickle'),
      top('Joblib'),
      top('Model loading'),
      top('FastAPI ML API'),
      top('Prediction endpoints'),
      top('Input validation'),
      top('Batch inference'),
      top('Model versioning'),
      top('Dockerizing ML applications'),
      top('CPU inference'),
      top('GPU inference'),
      top('ONNX basics'),
      top('Model optimization'),
    ],
    { description: 'Packaging and serving trained models behind production APIs.' }
  ),

  // ------------------------------------------------------------------
  // Module 20 — MLOps
  // ------------------------------------------------------------------
  sec(
    'MLOps',
    [
      top('MLOps fundamentals'),
      top('ML lifecycle'),
      top('Experiment tracking'),
      top('MLflow'),
      top('Model registry'),
      top('Dataset versioning'),
      top('DVC'),
      top('CI/CD for ML'),
      top('Model monitoring'),
      top('Data drift'),
      top('Concept drift'),
      top('Model performance monitoring'),
      top('Automated retraining'),
      top('Production ML pipelines'),
    ],
    { description: 'Operationalizing ML — tracking, versioning, monitoring and retraining.' }
  ),

  // ------------------------------------------------------------------
  // Optional projects
  // ------------------------------------------------------------------
  sec(
    'Projects — Machine Learning',
    [
      top('House Price Prediction', { description: 'Predict house prices from features using regression models.' }),
      top('Student Performance Prediction', { description: 'Predict student outcomes from demographic and study data.' }),
      top('Customer Churn Prediction', { description: 'Classify customers likely to churn from usage and billing data.' }),
      top('Spam Detection', { description: 'Classify messages as spam or ham with NLP features.' }),
      top('Credit Risk Prediction', { description: 'Assess loan default risk with classification models.' }),
      top('Customer Segmentation', { description: 'Segment customers into groups with clustering.' }),
      top('Recommendation System', { description: 'Build a content-based or collaborative recommendation engine.' }),
    ],
    { description: 'Optional hands-on ML projects — these do not count toward core progress.', optional: true }
  ),
  sec(
    'Projects — Deep Learning',
    [
      top('Image Classifier', { description: 'Classify images from a dataset with a fine-tuned CNN.' }),
      top('Face Recognition', { description: 'Detect and recognize faces using embeddings.' }),
      top('Sentiment Analysis', { description: 'Classify text sentiment with an LSTM or transformer.' }),
      top('Object Detection', { description: 'Locate and label objects in images with a detection model.' }),
    ],
    { description: 'Optional deep learning projects — these do not count toward core progress.', optional: true }
  ),
  sec(
    'Projects — ML + Backend',
    [
      top('ML Prediction API', { description: 'Serve predictions from a trained model via a FastAPI endpoint.' }),
      top('Resume Screening API', { description: 'Classify resumes by role with an NLP model behind an API.' }),
      top('Recommendation API', { description: 'Expose product recommendations through a REST endpoint.' }),
      top('AI Interview API', { description: 'Generate and score interview questions with an LLM API.' }),
      top('End-to-End ML Deployment', { description: 'Full pipeline from training to a monitored production API.' }),
    ],
    { description: 'Optional full-stack ML projects — these do not count toward core progress.', optional: true }
  ),
];

export const buildMachineLearningTemplate = () => ({
  title: 'Machine Learning',
  icon: 'Brain',
  subject: 'ml',
  description:
    'The complete Machine Learning curriculum — math, data preprocessing, classic ML, deep learning with PyTorch, generative AI, deployment and MLOps.',
  sections: machineLearningSections,
});