# Personalized_Learning_Platform

Xuhui Chen, 1005684537, xuhui.chen@mail.utoronto.ca
Yunyang Sun, 1005809877, yunyang.sun@mail.utoronto.ca
Kexin Sha, 1005926848, selina.sha@mail.utoronto.ca

# Motivation

Our online education platform fills a gap by offering a fair space for all educators and learners. Unlike traditional platforms that require teachers to be linked with big institutions, our site lets anyone sign up without complex rules or strict tests. This way, hobbyists, freelancers, and experts alike can share their knowledge, giving students more choices.

We focus on making education accessible to everyone. By removing old barriers, we create a space that values local talent and practical skills. Teachers can design engaging lessons that truly connect with students, leading to better learning outcomes. In short, our platform builds an inclusive environment where independent educators and motivated learners work together to improve online education.

# **Project Objectives**

The project aims to build a personalized learning platform where teachers offer courses on the platform, while students are able to join the courses provided by teachers.

# Technical Stack

The platform is built using a **Next.js full-stack approach**, leveraging **server-side rendering (SSR), static site generation (SSG), and API routes** for backend logic. This approach ensures a seamless and efficient development experience while maintaining high performance. To efficiently manage and store user-uploaded files, the platform utilizes an **external cloud storage service** (Supabase) instead of local storage. This approach ensures **scalability, reliability, and accessibility** while reducing server load.

## **Database Schema and relationships**

### **User Table**

Stores user accounts with role-based access.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `username` | `String` | `UNIQUE`, `NOT NULL` |
| `email` | `String` | `UNIQUE`, `NOT NULL` |
| `password` | `String` | `NOT NULL` |
| `first_name` | `String` | `NOT NULL` |
| `last_name` | `String` | `NOT NULL` |
| `role` | `ENUM` | `('STUDENT','TEACHER')`, `NOT NULL` |
| `created_at` | `DateTime` | `NOT NULL`, `DEFAULT now()` |

---

### **Course Table**

Stores course details.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `name` | `String` | `UNIQUE`, `NOT NULL` |
| `description` | `Text` | `NULLABLE` |
| `start_time` | `DateTime` | `NOT NULL` |
| `end_time` | `DateTime` | `NOT NULL` |
| `active` | `Boolean` | `NOT NULL`, `DEFAULT TRUE` |
| `teacher_id` | `Int` | `FOREIGN KEY → User(id)` `ON DELETE CASCADE`, `NOT NULL` |

---

### **CourseEnrollment Table**

Tracks student enrollments in courses.

| Column | Type | Constraints |
| --- | --- | --- |
| `user_id` | `Int` | `FOREIGN KEY → User(id)` `ON DELETE CASCADE` |
| `course_id` | `Int` | `FOREIGN KEY → Course(id)` `ON DELETE CASCADE` |

🔹 **Composite Primary Key (`user_id`, `course_id`)** to prevent duplicate enrollments.

---

### **Assignment Table**

Stores assignments with handouts.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `course_id` | `Int` | `FOREIGN KEY → Course(id)` `ON DELETE CASCADE`, `NOT NULL` |
| `title` | `String` | `NOT NULL` |
| `deadline` | `DateTime` | `NOT NULL` |
| `grade_percentage` | `Float` | `CHECK (grade_percentage BETWEEN 0 AND 100)` |
| `handout` | `Text` | `NULLABLE` |
| `submission_name` | `String` | `NOT NULL` |

---

### **AssignmentSubmission Table**

Stores student submissions.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `assignment_id` | `Int` | `FOREIGN KEY → Assignment(id)` `ON DELETE CASCADE`, `NOT NULL` |
| `user_id` | `Int` | via CourseEnrollment: `FOREIGN KEY (user_id, course_id)` `ON DELETE CASCADE`, `NOT NULL` |
| `course_id` | `Int` | via CourseEnrollment: `FOREIGN KEY (user_id, course_id)` `ON DELETE CASCADE`, `NOT NULL` |
| `file_path` | `String` | `NOT NULL` |
| `submitted_at` | `DateTime` | `NOT NULL`, `DEFAULT now()` |

🔹 **Unique** on (`assignment_id`, `user_id`) to prevent duplicate submissions.

---

### **Grade Table**

Stores student grades.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `assignment_id` | `Int` | `FOREIGN KEY → Assignment(id)` `ON DELETE CASCADE`, `NOT NULL` |
| `user_id` | `Int` | via CourseEnrollment: `FOREIGN KEY (user_id, course_id)` `ON DELETE CASCADE`, `NOT NULL` |
| `course_id` | `Int` | via CourseEnrollment: `FOREIGN KEY (user_id, course_id)` `ON DELETE CASCADE`, `NOT NULL` |
| `grade` | `Float` | `CHECK (grade BETWEEN 0 AND 100)`, `NOT NULL` |
| `comment` | `Text` | `NULLABLE` |

🔹 **Unique** on (`assignment_id`, `user_id`) to ensure one grade per student per assignment.

---

### **MaterialFolder Table**

Stores hierarchical folders for educational materials.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `name` | `String` | `NOT NULL` |
| `parent_id` | `Int` | `NULLABLE`, `FOREIGN KEY → MaterialFolder(id)` `ON DELETE CASCADE` |
| `course_id` | `Int` | `FOREIGN KEY → Course(id)` `ON DELETE CASCADE`, `NOT NULL` |
| `created_at` | `DateTime` | `NOT NULL`, `DEFAULT now()` |

---

### **MaterialFile Table**

Stores files inside folders.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `folder_id` | `Int` | `FOREIGN KEY → MaterialFolder(id)` `ON DELETE CASCADE` |
| `filename` | `String` | `NOT NULL` |
| `file_path` | `String` | `NOT NULL` |
| `uploaded_by` | `Int` | `FOREIGN KEY → User(id)` `ON DELETE CASCADE`, `NOT NULL` |
| `created_at` | `DateTime` | `NOT NULL`, `DEFAULT now()` |

# **Features**

## **1. User Authentication with Different Roles**

- **User registration**: Register as a **Teacher** or **Student**.
- **User login**: Secure authentication for accessing the platform.

## 2. User Profile Display

- **View user profile:** Show the username, email, first name, last name, and user role. These fields are read-only.

## **3. Course Creation and Management (Teacher)**

- **Course creation**: Teachers can create courses on the platform.
- **Add students to a course**: Teachers can add students to courses by searching their usernames.
- **Remove students from courses**: Teachers can remove students
- **Modify course details**: Teachers can update course description, start/end date, and active/inactive status.

## **4. Interactive Content Builder (Teacher)**

- **Build assignments**: Design assignments with detailed instructions.
- **Manage learning materials:** Upload/Delete learning materials (PDFs, videos, etc.) to folders.

## **Assignment Submission and Grading**

### **(a) Student Actions**

- **Assignment submission**: Upload solutions as files.
- **View/download graded assignments:** View grades and comments of graded submission and can download the submitted file.

### **(b) Teacher Actions**

- **Assignment grading**: Manually review, grade, and comment on student solutions.

## **Cloud Storage for Educational Content**

- **Teachers**: Upload course materials to the platform.
- **Students**: Upload assignment solutions.

## **How These Features Fulfill the Course Requirements**

The platform is designed to fully meet the core technical requirements while implementing **advanced features** to enhance functionality and user experience.

### **Frontend Requirements**

- **Next.js for UI Development**: The platform uses **Next.js** to build an interactive and dynamic user experience.
- **Tailwind CSS for Styling**: A utility-first CSS framework ensures responsive and modern design.
- **shadcn/ui for Components**: Prebuilt components for buttons, forms, and modals enhance UI consistency.
- **Responsive Design**: The UI is fully optimized for different screen sizes to support mobile and desktop users.

### **Data Storage Requirements**

- **PostgreSQL for Relational Data**: Prisma ORM is used to manage course data, user authentication, assignments, and submissions.
- **Cloud Storage for File Handling**: An external cloud storage service (Supabase) is used for **storing assignment submissions and course materials**, ensuring scalability.

### **Chosen Architecture Approach**

The project follows **Option A: Next.js Full-Stack**, implementing:

- Next.js 13+ with App Router.
- Server Components for backend logic.
- API Routes for data handling.
- Server Actions for mutations.

### **Advanced Features**

- **User Authentication & Authorization**:
    - Role-based authentication (`Teacher` vs. `Student`).
- **File Handling and Processing**:
    - Cloud storage integration for file uploads.
    - Pre-signed URL handling for secure file access.
    - Automatic file deletion upon course withdrawal.
- **API Integration with External Services**:
    - Cloud storage API integration for managing course materials and assignment submissions.

# **User Guide**

# **Development Guide**

# **Deployment Information**

# **Individual Contributions**

## Kexin (Selina) Sha’s Contribution

- Set up Github Repository
- Wrote project proposal motivation section
- Implemented features
    - **Courses related:** create course, edit course, course home page
    - **Assignment related:** assignment list, create assignment feature, assignment details, upload materials, edit assignments
    - **Display Information:** view grade, view submission, view user profile
- Completed inline api documentation

# **Lessons Learned**

## Iterative Data Modeling & API Contract Design

We began with a simple Prisma schema and clear API docs, which helped us move fast. When users ran into issues like signing up for the same course twice or using nested folders, we updated the schema and managed versions carefully. Writing small, step‑by‑step migrations from the start made those changes much easier.

## Balancing Next.js Rendering Modes & Cloud Storage Integration

We used Next.js’s built‑in page rendering features together with Supabase for file uploads, which gave us fast‑loading pages and made development much smoother.

# **Concluding Remarks**

Overall, this project successfully delivered an inclusive, scalable learning platform that empowers any educator to share expertise and any learner to access diverse courses. By combining a robust relational schema, end‑to‑end type safety in TypeScript, and cloud‑native storage, we met our objectives for performance, reliability, and ease of use. Moving forward, we can build on this foundation with features like real‑time notifications, analytics dashboards, and more granular permissions to further enhance the teaching and learning experience.

# Video Demo