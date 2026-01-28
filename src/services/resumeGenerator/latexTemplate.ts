import type {
  ResumeWorkExperience,
  ResumeProject,
} from "./dataExtractor"

// Escape special LaTeX characters
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
}

// Generate the LaTeX resume content
export function generateLatexResume(
  workExperiences: ResumeWorkExperience[],
  projects: ResumeProject[]
): string {
  // Fixed data for testing
  const name = "Alex Chen"
  const email = "alex.chen@example.com"
  const phone = "555-123-4567"
  const linkedin = "linkedin.com/in/alexchen"
  const github = "github.com/alexchen"

  // Escape work experience data
  const escapedWorkExperiences = workExperiences.map((exp) => ({
    ...exp,
    company: escapeLatex(exp.company),
    role: escapeLatex(exp.role),
    location: escapeLatex(exp.location),
    resumePoints: exp.resumePoints.map(escapeLatex),
  }))

  // Escape project data
  const escapedProjects = projects.map((proj) => ({
    name: escapeLatex(proj.name),
    techStack: escapeLatex(proj.techStack),
    resumePoints: proj.resumePoints.map(escapeLatex),
  }))

  // Generate experience section
  const experienceSection = escapedWorkExperiences
    .map((exp) => {
      const dateRange =
        exp.endDate === "Present"
          ? `${exp.startDate} -- Present`
          : `${exp.startDate} -- ${exp.endDate}`

      const resumePoints = exp.resumePoints
        .map((point) => `\\resumeItem{${point}}`)
        .join("\n")

      return `\\resumeSubheading
{${exp.company}}{${dateRange}}
{${exp.role}}{${exp.location}}
\\resumeItemListStart
${resumePoints}
\\resumeItemListEnd`
    })
    .join("\n\n")

  // Generate projects section
  const projectsSection = escapedProjects
    .map((proj) => {
      const resumePoints = proj.resumePoints
        .map((point) => `\\resumeItem{${point}}`)
        .join("\n")

      return `\\resumeProjectHeading
{\\textbf{${proj.name}} $|$ \\emph{${proj.techStack}}}{}
\\resumeItemListStart
${resumePoints}
\\resumeItemListEnd`
    })
    .join("\n\n")

  // Full LaTeX template
  return `%-------------------------
% Resume in Latex
% Based off of: https://github.com/jakegut/resume
% License : MIT
%------------------------
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

%----------FONT OPTIONS----------
% Using default sans-serif font
% \\usepackage[default]{sourcesanspro}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
\\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}

\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%% RESUME STARTS HERE %%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\begin{document}

%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
  \\small ${phone} $|$ \\href{mailto:${email}}{\\underline{${email}}} $|$
  \\href{https://${linkedin}}{\\underline{${linkedin}}} $|$
  \\href{https://${github}}{\\underline{${github}}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {State University}{San Francisco, CA}
      {Bachelor of Science in Computer Science}{Aug. 2019 -- May 2023}
      \\resumeItemListStart
        \\resumeItem{GPA: 3.8/4.0, Dean's List all semesters}
        \\resumeItem{Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
${
  workExperiences.length > 0
    ? `\\section{Experience}
  \\resumeSubHeadingListStart
${experienceSection}
  \\resumeSubHeadingListEnd`
    : ""
}

%-----------PROJECTS-----------
${
  projects.length > 0
    ? `\\section{Projects}
  \\resumeSubHeadingListStart
${projectsSection}
  \\resumeSubHeadingListEnd`
    : ""
}

%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      \\textbf{Languages}{: TypeScript, JavaScript, Python, Java, SQL, HTML/CSS} \\\\
      \\textbf{Frameworks}{: React, Next.js, Node.js, Express, Spring Boot} \\\\
      \\textbf{Developer Tools}{: Git, Docker, AWS, VS Code, Postman} \\\\
      \\textbf{Libraries}{: Redux, Tailwind CSS, MongoDB, PostgreSQL}
    }}
  \\end{itemize}

%-------------------------------------------
\\end{document}
`
}
