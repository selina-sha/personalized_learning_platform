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

## 1. User Registration and Login
1. Visit the homepage at `localhost:3000`
2. Click **Register** to create an account, or **Login** if you already have one
3. For "Register", fill in your credentials and choose a role: **Teacher** or **Student**, then it will redirect to "Login"
4. For "Login", use the username and password that you registered

![homepage](./screenshots/1.png)
![register page](./screenshots/2.png)
![login page](./screenshots/3.png)

## 2. Dashboard Overview
After logging in:
- **Teachers** see a list of courses they created, as well as the **Create Course** button
- **Students** see courses they are enrolled in
- Each course is clickable to see details
- Use the filter buttons ("All", "Active", "Inactive") to view relevant courses
- Use **Your Profile** button to view personal profile

Teacher_dashboard:
![Teacher dashboard](./screenshots/4.png)
Student_dashboard :
![Student dashboard](./screenshots/5.png)
Profile:
![Profile](./screenshots/29.png)

## 3. Creating a Course (Teacher Only)
1. Click **Create Course** on the dashboard
2. Fill in course details: course name, description, start/end date
3. Click **Create** to publish

![Create course](./screenshots/6.png)

## 4. Course Overview
### Teacher:
- Navigation menu: home, people, assignments, materials
- Home: Display course information; edit course
- People: Display list of enrolled students; manage students
- Assignments: Display the current assignments (click to see details); create or edit assignments
- Materials: Display any course material files and manage them

home:
![Teacher home](./screenshots/7.png)
people:
![Teacher people](./screenshots/8.png)

### Student:
- Navigation menu: home, people, assignments, materials, grades
- Home: Display course information
- People: Display list of enrolled students
- Assignments: Display the current assignments (click to see details); submit assignments; view submission
- Materials: Display any course material files

home:
![Student home](./screenshots/9.png)
people:
![Student people](./screenshots/10.png)

## 5. Edit Course (Teacher Only)
1. Open a course → Go to **Home** tab
2. Click **Edit Course**
3. Enter all the details need to be changed including making the course active or inactive, then click **Save Changes**

![Edit course](./screenshots/11.png)

## 6. Managing People (Teacher Only)
### Add a Student:
1. Open a course → Go to **People** tab
2. Enter student username under "Add Student" section, and click **Add**
3. Student will be enrolled in the course, name will be showed under "Enrolled Students" section

![Add student 1](./screenshots/12.png)
![Add student 2](./screenshots/13.png)

### Remove a Student:
1. From the "Enrolled Students" list, click **Remove** beside a student's name

![Remove student](./screenshots/14.png)

## 7. Uploading Materials (Teacher Only)
1. Inside a course, go to the **Materials** tab
2. Create folders if needed
3. Upload files (PDFs, videos, etc.) in the corresponding folders to organize learning materials
4. Click **Delete** beside the file to delete any undesired files

![Upload materials 1](./screenshots/15.png)
![Upload materials 2](./screenshots/16.png)

## 8. Assignments (Both Roles)
Both teacher and student will see the assignment list under the **Assignments** tab.
Each assignment in the list is clickable.

### For Teachers:
- Create an assignment with **Create Assignment** button
- Set assignment details and specify the expected submission filename
- Each assignment is able to be edited and all student submission is accessible
- Click **View Submissions** to download the submission file of each student and grade it

![Teacher assignment 1](./screenshots/17.png)
![Teacher assignment 2](./screenshots/18.png)
![Teacher assignment 3](./screenshots/19.png)
![Teacher assignment 4](./screenshots/20.png)
![Teacher assignment 5](./screenshots/21.png)

### For Students:
- Submit files via the **Submit Assignment** button
- Files must match the expected name format

![Student assignment 1](./screenshots/22.png)
![Student assignment 2](./screenshots/23.png)
![Student assignment 3](./screenshots/24.png)

## 9. Grading and Viewing Grades
### Teachers:
- Go to Assignments tab → choose the specific assignment → **View Submissions** -> **Download** the file to review -> **Grade** submitted files
- Provide optional comments

![Grading 1](./screenshots/25.png)
![Grading 2](./screenshots/26.png)

### Students:
- View feedback and grades in the **Grades** tab or **View My Submission** in each assignment

![Student grades 1](./screenshots/27.png)
![Student grades 2](./screenshots/28.png)

# **Development Guide**

## Environment Setup

The project requires:

- [Node.js](https://nodejs.org/) and `npm`
- A running **PostgreSQL** instance
- A **Supabase** account for file storage

---

## Setup Script

We provide a bash script to automate environment configuration:

```
#!/bin/bash

echo "Setting up environment..."

# Prompt for DB username
read -p "Enter your PostgreSQL username: " db_user

# Create .env file from template
cp env_example .env

# Replace the default username with the user's input
sed -i '' "s/user@localhost/${db_user}@localhost/" .env

# Run setup commands
echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Setup complete. .env configured with username '${db_user}'"
echo "Run the server with: npm run dev"
```

---

## .env File Configuration

Your `.env` file should include the following environment variables:

```
DATABASE_URL=postgresql://user@localhost:5432/dbname
NEXTAUTH_SECRET=your-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Database Initialization

Once your `.env` is configured:

1. Create the database manually or through a GUI like `psql` or TablePlus.
2. Run the Prisma migrations to set up your schema:

```
npx prisma migrate dev --name init
```

---

## Cloud Storage Configuration (Supabase)

We use Supabase for managing file uploads:

- A Supabase bucket (e.g., `course-materials`) must be created.
- Files are uploaded via server routes using the **Service Role Key** for full access.
- Students download materials using **signed URLs** for secure, temporary access.

Note: Only private buckets are supported.

---

## Local Development and Testing

You can run the development server using:

```
npm run dev
```

### Tools:

- **Prisma Studio**: to browse and edit your data

```
npx prisma studio
```

- Local testing: The full functionality of the platform can be tested locally, including user authentication, course creation and editing, file upload and retrieval, student enrollment, assignment publishing, and student submissions. This allows end-to-end validation without needing to deploy to production.


# **Deployment Information**

# **Individual Contributions**

## Git Contribution Summary

We ran `git fame` in the `app/` directory to measure each member’s net meaningful code contribution. All members exceeded the required threshold of **1000 lines of code (LOC)**.

### Project Stats:
- **Total commits analyzed**: 373
- **Total files tracked**: 55
- **Total lines of code (LOC)**: 3,494

### Contribution Breakdown:

| Author       | LOC   | Commits | Files | Distribution (LOC/Commits/Files) |
|--------------|-------|---------|--------|----------------------------------|
| Kexin Sha    | 1190  | 20      | 20     | 34.1% / 27.0% / 36.4%            |
| Xuhui Chen   | 1183  | 33      | 18     | 33.9% / 44.6% / 32.7%            |
| Yunyang Sun  | 1121  | 19      | 17     | 32.1% / 25.7% / 30.9%            |

Each team member contributed meaningfully across the codebase, with balanced effort in both logic and structure.

### Xuhui Chen
- Designed and implemented authentication and role-based access (e.g., login, register, access control)
- Developed the course people management feature (adding/removing students, viewing details)
- Set up Supabase cloud storage integration, including file upload and signed URL downloads
- Led database schema design, including Prisma schema, migrations, and relationships
- Implemented course material folder/file view and upload functionality
- Wrote core environment setup scripts and `.env` configuration
- Helped review and merge various pull requests from team members

### Yunyang Sun
- Implemented assignment submission flow for students
- Developed the assignment grading interface for teachers
- Added viewable submission details and grade history
- Refined edit-assignment logic and UI interactions
- Contributed to the add/remove student logic and real-time updates
- Authored inline and API documentation related to assignments and submissions

### Kexin Sha
- Designed and implemented course dashboard, course home, and edit views
- Built the assignment list, create assignment form, and assignment detail page
- Created UI for viewing submissions and student grades
- Developed "Your Profile" view and contributed to layout consistency
- Authored inline documentation and project API descriptions
- Merged and managed multiple UI and feature branches


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