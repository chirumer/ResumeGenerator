# Data Folder Documentation

This document describes the structure and file format requirements for the Resume Generator data folder.

## Folder Structure

```
backend/data/
├── general/
│   └── general.json
├── projects/
│   ├── projects.json
│   ├── project_descriptions/
│   └── resume_points/
└── work_experiences/
    ├── work_experiences.json
    ├── experience_descriptions/
    └── resume_points/
```

## JSON File Specifications

### `general/general.json`

Contains personal information and skills. Validated by `GeneralSchema` in `packages/shared-types/src/schemas/general.ts`.

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567",
  "location": "San Francisco, CA",
  "links": [
    {
      "type": "GitHub",
      "url": "https://github.com/johndoe",
      "label": "github.com/johndoe"
    },
    {
      "type": "LinkedIn",
      "url": "https://linkedin.com/in/johndoe",
      "label": "linkedin.com/in/johndoe"
    },
    {
      "type": "Portfolio",
      "url": "https://johndoe.dev",
      "label": "johndoe.dev"
    }
  ],
  "skills": {
    "languages": "TypeScript, Python, Go, SQL",
    "frameworks": "React, Next.js, Express, NestJS",
    "tools": "Git, Docker, Kubernetes, AWS, Terraform",
    "libraries": "Zod, Prisma, Redux, TailwindCSS"
  }
}
```

**Schema Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, must be a valid email address
- `phone`: Required, non-empty string
- `location`: Optional string (defaults to empty)
- `links`: Array of link objects (defaults to empty array)
  - Each link requires `type`, `url`, and `label` (all non-empty strings)
- `skills`: Optional object (defaults to empty strings)
  - All fields (`languages`, `frameworks`, `tools`, `libraries`) are optional strings

---

### `projects/projects.json`

Contains an array of project metadata. Validated by `ProjectsArraySchema` in `packages/shared-types/src/schemas/project.ts`.

```json
[
  {
    "id": "ecommerce-platform",
    "project_name": "E-Commerce Platform",
    "description_file": "ecommerce-platform.md",
    "github": {
      "url": "https://github.com/johndoe/ecommerce-platform",
      "commit_count": 347
    },
    "categories": [
      {
        "category_name": "fullstack",
        "resume_points_file": "ecommerce-platform-fullstack.md"
      },
      {
        "category_name": "frontend",
        "resume_points_file": "ecommerce-platform-frontend.md"
      },
      {
        "category_name": "backend",
        "resume_points_file": "ecommerce-platform-backend.md"
      }
    ],
    "user_notes": "",
    "archived": false
  }
]
```

**Schema Validation Rules:**
- `id`: Required, non-empty string (unique identifier)
- `project_name`: Required, non-empty string
- `description_file`: Required, must end with `.md`
- `github`: Required object
  - `url`: Required, empty string or valid HTTP/HTTPS URL
  - `commit_count`: Required, non-negative integer
- `categories`: Required array, must contain at least one category
  - `category_name`: Required, non-empty string
  - `resume_points_file`: Required, must end with `.md`
- `user_notes`: Optional string (defaults to empty)
- `archived`: Optional boolean (defaults to `false`)

---

### `work_experiences/work_experiences.json`

Contains an array of work experience metadata. Validated by `WorkExperiencesArraySchema` in `packages/shared-types/src/schemas/workExperience.ts`.

```json
[
  {
    "id": "techcorp-senior-fullstack",
    "company": "TechCorp Solutions",
    "role": "Senior Full Stack Developer",
    "location": "San Francisco, CA",
    "startDate": "2023-06-01",
    "endDate": null,
    "description_file": "techcorp-senior-fullstack.md",
    "categories": [
      {
        "category_name": "fullstack",
        "resume_points_file": "techcorp-senior-fullstack-fullstack.md"
      },
      {
        "category_name": "backend",
        "resume_points_file": "techcorp-senior-fullstack-backend.md"
      }
    ],
    "tags": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    "archived": false,
    "user_notes": ""
  }
]
```

**Schema Validation Rules:**
- `id`: Required, non-empty string (unique identifier)
- `company`: Required, non-empty string
- `role`: Required, non-empty string
- `location`: Optional string
- `startDate`: Required, ISO date string (e.g., `"2023-06-01"`)
- `endDate`: Optional, can be `null` for current positions
- `description_file`: Required, must end with `.md`
- `categories`: Required array, must contain at least one category
  - `category_name`: Required, non-empty string
  - `resume_points_file`: Required, must end with `.md`
- `tags`: Required array of strings
- `archived`: Optional boolean (defaults to `false`)
- `user_notes`: Optional string (defaults to empty)

---

## Markdown File Guidelines

### Project Descriptions (`projects/project_descriptions/`)

These files contain detailed descriptions of projects. File names should match the `description_file` value in `projects.json`.

**Example** (`portfolio-generator.md`):
```markdown
# Portfolio Generator

A dynamic portfolio website generator that allows developers to create professional portfolios from a JSON configuration. Users can customize themes, add projects, write blog posts, and integrate with social media platforms.

The generator builds static sites for optimal performance and can be deployed to various hosting platforms. Includes pre-built templates, dark mode support, and contact form integration.
```

**Format Guidelines:**
- Use a level 1 heading (`#`) for the project name
- Write 1-2 paragraphs describing the project
- Focus on what the project does, technologies used, and key features

### Work Experience Descriptions (`work_experiences/experience_descriptions/`)

These files contain detailed descriptions of work experiences. File names should match the `description_file` value in `work_experiences.json`.

**Example** (`techcorp-senior-fullstack.md`):
```markdown
# TechCorp Solutions - Senior Full Stack Developer

Leading development of enterprise web applications serving Fortune 500 clients. Mentoring junior developers and driving technical decisions for the engineering team. Architected microservices infrastructure improving system scalability and reducing deployment time by 60%.
```

**Format Guidelines:**
- Use a level 1 heading (`#`) with format "Company Name - Role"
- Write 1-2 paragraphs describing the work
- Focus on impact, scope, and key achievements

### Resume Points (`projects/resume_points/` and `work_experiences/resume_points/`)

These files contain categorized bullet points for resumes. They are organized in subdirectories by category name.

**Example** (`projects/resume_points/backend/api-gateway-backend.md`):
```markdown
- Built high-performance API Gateway using Go and Kubernetes, handling 10,000+ requests per second
- Implemented JWT authentication and OAuth2 integration, securing 50+ microservices endpoints
- Designed custom rate limiting middleware with Redis-backed counters, preventing abuse
- Developed request/response transformation plugins for legacy system integration
- Achieved sub-millisecond latency through connection pooling and optimizations
```

**Example** (`work_experiences/resume_points/fullstack/techcorp-senior-fullstack-fullstack.md`):
```markdown
- Led development of enterprise web applications serving Fortune 500 clients
- Mentored 3 junior developers on best practices and code review processes
- Architected microservices infrastructure improving scalability by 60%
- Reduced deployment time from 2 hours to 15 minutes through CI/CD optimization
- Drove technical decisions for engineering team of 8 developers
```

**Format Guidelines:**
- Each bullet point must start with a hyphen (`-`)
- Write action-oriented statements (e.g., "Built...", "Implemented...", "Led...")
- Include quantifiable metrics when possible (e.g., "60% improvement", "10,000+ requests")
- Group related points by category

---

## File Naming Conventions

All markdown files use **kebab-case** slugs (lowercase with hyphens separating words):

- Project descriptions: `portfolio-generator.md`
- Work experience descriptions: `techcorp-senior-fullstack.md`
- Resume points: `ecommerce-platform-fullstack.md`

**Pattern**: `[entity-slug]-[category].md`

Where:
- `entity-slug`: A unique identifier derived from the project or company name
- `category`: The category name (e.g., `fullstack`, `backend`, `frontend`, `devops`, etc.)

---

## How to Add New Content

### Adding a New Project

1. **Create the project entry in `projects/projects.json`:**
   - Generate a unique `id` (kebab-case)
   - Set `project_name`
   - Specify `description_file` (will create this file)
   - Add GitHub info with `url` and `commit_count`
   - Define at least one `category` with `category_name` and `resume_points_file`

2. **Create the project description file** in `projects/project_descriptions/`:
   - Name it to match `description_file`
   - Write a 1-2 paragraph description with a heading

3. **Create resume points files** in `projects/resume_points/`:
   - Create a subdirectory for each category (if it doesn't exist)
   - Create markdown files matching each `resume_points_file`
   - Write bullet points for each category

### Adding a New Work Experience

1. **Create the work experience entry in `work_experiences/work_experiences.json`:**
   - Generate a unique `id` (kebab-case)
   - Set `company`, `role`, `location`
   - Add `startDate` (ISO date format) and `endDate` (or `null` for current)
   - Specify `description_file`
   - Define at least one `category`
   - Add relevant `tags`

2. **Create the experience description file** in `work_experiences/experience_descriptions/`:
   - Name it to match `description_file`
   - Write a 1-2 paragraph description with a heading

3. **Create resume points files** in `work_experiences/resume_points/`:
   - Create a subdirectory for each category (if it doesn't exist)
   - Create markdown files matching each `resume_points_file`
   - Write bullet points for each category

### Creating a New Category

Categories are created implicitly by adding a new subdirectory in the `resume_points/` folder:

1. Create a new folder: `projects/resume_points/[category-name]/` or `work_experiences/resume_points/[category-name]/`
2. Add resume point markdown files to this folder
3. Reference the category in the JSON entries

Common categories include: `frontend`, `backend`, `fullstack`, `devops`, `database`, `security`, `ml`, `mobile`

---

## Schema References

All data is validated using Zod schemas in `packages/shared-types/src/schemas/`:

- `general.ts` - Defines `GeneralSchema`, `GeneralLinkSchema`, `GeneralSkillsSchema`
- `project.ts` - Defines `ProjectSchema`, `GitHubSchema`, `CategorySchema`
- `workExperience.ts` - Defines `WorkExperienceSchema`, `WorkExperienceCategorySchema`

These schemas ensure data integrity and provide TypeScript types for the application.
