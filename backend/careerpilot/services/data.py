TARGET_ROLES = {
    "Data Scientist": {
        "skills": [
            "python",
            "sql",
            "statistics",
            "machine learning",
            "pandas",
            "numpy",
            "scikit-learn",
            "data visualization",
            "tableau",
            "power bi",
            "tensorflow",
        ],
        "salary": [95000, 108000, 122000, 138000],
        "demand": [68, 74, 82, 88],
    },
    "AI Engineer": {
        "skills": [
            "python",
            "deep learning",
            "tensorflow",
            "pytorch",
            "nlp",
            "computer vision",
            "llm",
            "mlops",
            "docker",
            "kubernetes",
            "cloud",
        ],
        "salary": [112000, 128000, 146000, 162000],
        "demand": [72, 81, 89, 94],
    },
    "Machine Learning Engineer": {
        "skills": [
            "python",
            "machine learning",
            "scikit-learn",
            "tensorflow",
            "pytorch",
            "feature engineering",
            "mlops",
            "docker",
            "aws",
            "api",
            "model deployment",
        ],
        "salary": [105000, 120000, 137000, 153000],
        "demand": [70, 78, 85, 91],
    },
    "Software Engineer": {
        "skills": [
            "javascript",
            "python",
            "java",
            "data structures",
            "algorithms",
            "git",
            "api",
            "testing",
            "sql",
            "system design",
            "cloud",
        ],
        "salary": [91000, 106000, 124000, 143000],
        "demand": [76, 80, 84, 87],
    },
    "Full Stack Developer": {
        "skills": [
            "javascript",
            "typescript",
            "react",
            "node.js",
            "python",
            "flask",
            "sql",
            "api",
            "docker",
            "tailwind",
            "testing",
        ],
        "salary": [87000, 101000, 117000, 132000],
        "demand": [73, 77, 82, 86],
    },
}

TECHNICAL_SKILLS = sorted(
    {
        skill
        for role in TARGET_ROLES.values()
        for skill in role["skills"]
    }
    | {
        "html",
        "css",
        "redux",
        "mongodb",
        "postgresql",
        "mysql",
        "azure",
        "gcp",
        "linux",
        "fastapi",
        "django",
        "spark",
        "hadoop",
        "excel",
        "github",
        "ci/cd",
        "rest",
        "graphql",
        "prompt engineering",
        "rag",
        "langchain",
        "opencv",
    }
)

COURSES = {
    "Data Scientist": [
        {"title": "Kaggle Python and Machine Learning", "provider": "Kaggle", "price": "Free", "url": "https://www.kaggle.com/learn"},
        {"title": "Applied Data Science with Python", "provider": "Coursera", "price": "Paid", "url": "https://www.coursera.org/specializations/data-science-python"},
    ],
    "AI Engineer": [
        {"title": "Deep Learning Specialization", "provider": "DeepLearning.AI", "price": "Paid", "url": "https://www.coursera.org/specializations/deep-learning"},
        {"title": "Generative AI for Beginners", "provider": "Microsoft", "price": "Free", "url": "https://github.com/microsoft/generative-ai-for-beginners"},
    ],
    "Machine Learning Engineer": [
        {"title": "Machine Learning Engineering for Production", "provider": "DeepLearning.AI", "price": "Paid", "url": "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"},
        {"title": "Google Machine Learning Crash Course", "provider": "Google", "price": "Free", "url": "https://developers.google.com/machine-learning/crash-course"},
    ],
    "Software Engineer": [
        {"title": "CS50x", "provider": "Harvard", "price": "Free", "url": "https://cs50.harvard.edu/x/"},
        {"title": "Grokking Coding Interview Patterns", "provider": "Educative", "price": "Paid", "url": "https://www.educative.io/"},
    ],
    "Full Stack Developer": [
        {"title": "Full Stack Open", "provider": "University of Helsinki", "price": "Free", "url": "https://fullstackopen.com/en/"},
        {"title": "React - The Complete Guide", "provider": "Udemy", "price": "Paid", "url": "https://www.udemy.com/"},
    ],
}
