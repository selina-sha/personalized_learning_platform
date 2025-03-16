# personalized_learning_platform
# Motivation
Our online education platform fills a gap by offering a fair space for all educators and learners. Unlike traditional platforms that require teachers to be linked with big institutions, our site lets anyone sign up without complex rules or strict tests. This way, hobbyists, freelancers, and experts alike can share their knowledge, giving students more choices.

We focus on making education accessible to everyone. By removing old barriers, we create a space that values local talent and practical skills. Teachers can design engaging lessons that truly connect with students, leading to better learning outcomes. In short, our platform builds an inclusive environment where independent educators and motivated learners work together to improve online education.

# **Project Objectives**
The project aims to build a **personalized learning platform** where teachers offer courses on the platform, while students are able to join the courses provided by teachers.

---

## **Core Features**

### **User Authentication with Different Roles**
- **User registration**: Register as a **Teacher** or **Student**.
- **User login**: Secure authentication for accessing the platform.

### **Course Creation and Management (Teacher)**
- **Course creation**: Teachers can create courses on the platform.
- **Add students to a course**: Students can enroll or be added to courses.
- **Modify course description**: Teachers can update course details.

### **Interactive Content Builder (Teacher)**
- **Build assignments**: Design assignments with detailed instructions.

### **Assignment Submission and Grading**
#### **(a) Student Actions**
- **Assignment submission**: Upload solutions as files.

#### **(b) Teacher Actions**
- **Assignment grading**: Manually review, grade, and comment on student solutions.

### **Cloud Storage for Educational Content**
- **Teachers**: Upload course materials to the platform.
- **Students**: Upload assignment solutions.

### **Calendar Integration**
- **Deadline tracking**: Students can view upcoming assignment deadlines from all enrolled courses in a single calendar.  

---


## **Technical Implementation Approach**

The platform will be built using a **Next.js full-stack approach** combined with an **Express.js backend** for API handling. This hybrid architecture leverages the benefits of **server-side rendering (SSR), static site generation (SSG), and API routes** in Next.js while maintaining the flexibility of an Express.js backend for complex API logic.

### **Why This Approach?**
- **Scalability**: Next.js allows optimized performance with its hybrid rendering model.
- **Developer Efficiency**: Full-stack Next.js minimizes the need for separate frontend and backend hosting.
- **Performance**: SSR improves SEO and reduces load times, especially for dynamic course content.
- **Flexibility**: Express.js provides a lightweight yet powerful backend for API handling.


# **Database Schema and relationships**

## **User Table**
Stores user accounts with role-based access.

| Column     | Type      | Constraints               |
|------------|---------|--------------------------|
| `id`       | `Int`   | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `username` | `String` | `UNIQUE`, `NOT NULL` |
| `password` | `String` | `NOT NULL` |
| `email`    | `String` | `UNIQUE`, `NOT NULL` |
| `first_name` | `String` | `NOT NULL` |
| `last_name` | `String` | `NOT NULL` |
| `role`     | `ENUM('STUDENT', 'TEACHER')` | `NOT NULL` |


---

## **Course Table**
Stores course details.

| Column         | Type        | Constraints                    |
|---------------|------------|--------------------------------|
| `id`         | `Int`      | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `name`       | `String`   | `UNIQUE`, `NOT NULL` |
| `description` | `Text`     | `NULLABLE` |
| `start_time` | `DateTime` | `NOT NULL` |
| `end_time`   | `DateTime` | `NOT NULL` |
| `active`     | `Boolean`  | `DEFAULT TRUE` |
| `teacher_id` | `Int`      | `FOREIGN KEY REFERENCES User(id) ON DELETE CASCADE` |

 

---

## **CourseEnrollment Table**
Tracks student enrollments in courses.

| Column    | Type  | Constraints |
|-----------|------|------------|
| `user_id`  | `Int` | `FOREIGN KEY REFERENCES User(id) ON DELETE CASCADE` |
| `course_id` | `Int` | `FOREIGN KEY REFERENCES Course(id) ON DELETE CASCADE` |

🔹 **Composite Primary Key (`user_id`, `course_id`)** to prevent duplicate enrollments.

---

## **Assignment Table**
Stores assignments with handouts.

| Column         | Type   | Constraints |
|--------------|------|------------|
| `id`        | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `course_id`   | `Int`      | `UNIQUE`, `FOREIGN KEY REFERENCES Course(id) ON DELETE CASCADE` |
| `title`       | `String`   | `NOT NULL` |
| `deadline`    | `DateTime` | `NOT NULL` |
| `grade_percentage` | `Float` | `CHECK (grade_percentage BETWEEN 0 AND 100)` |
| `handout`   | `Text` | `NULLABLE` |

---

## **AssignmentSubmission Table**
Stores student submissions.

| Column           | Type   | Constraints |
|--------------|------|------------|
| `id`         | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `course_enrollment_id` | `Int` | `FOREIGN KEY REFERENCES CourseEnrollment(user_id, course_id) ON DELETE CASCADE` |
| `assignment_id` | `Int` | `FOREIGN KEY REFERENCES Assignment(id) ON DELETE CASCADE` |
| `file_path`   | `String` | `NOT NULL` |


---

## **Grade Table**
Stores student grades.

| Column           | Type   | Constraints |
|--------------|------|------------|
| `coursework_id` | `Int` | `FOREIGN KEY REFERENCES CourseWork(id) ON DELETE CASCADE` |
| `course_enrollment_id` | `Int` | `FOREIGN KEY REFERENCES CourseEnrollment(user_id, course_id) ON DELETE CASCADE` |
| `grade`        | `Float` | `CHECK (grade BETWEEN 0 AND 100)` |
| `comment`      | `Text`  | `NULLABLE` |

---

## **MaterialFolder Table**
Stores hierarchical folders for educational materials.

| Column     | Type   | Constraints |
|------------|------|------------|
| `id`       | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `parent_id` | `Int` | `NULLABLE`, `FOREIGN KEY REFERENCES MaterialFolder(id) ON DELETE CASCADE` |
| `name`     | `String` | `NOT NULL` |

---

## **Material Table**
Stores files inside folders.

| Column     | Type   | Constraints |
|------------|------|------------|
| `id`       | `Int` | `PRIMARY KEY`, `AUTO_INCREMENT` |
| `parent_folder_id` | `Int` | `NULLABLE`, `FOREIGN KEY REFERENCES MaterialFolder(id) ON DELETE CASCADE` |
| `filename` | `String` | `NOT NULL` |
| `file_path` | `String` | `NOT NULL` |

---

## **Cloud storage for dataset files**

To efficiently manage and store user-uploaded files, the platform will utilize an **external cloud storage service** instead of local storage. This approach ensures **scalability, reliability, and accessibility** while reducing server load.

### **Storage Use Cases**
- **Assignment Submissions**: Students upload assignment files (e.g., PDFs, DOCX, images).
- **Course Materials**: Teachers upload course-related files such as lecture slides, handouts, and resources.

### **Cloud Storage Solution**
- **Service Considerations**:
  - AWS S3
  - Google Cloud Storage
  - Firebase Storage

### **Why Cloud Storage?**
- **Scalability**: Handles large file volumes without increasing server strain.
- **Security**: Built-in encryption and access control mechanisms.
- **Reliability**: Ensures high availability and redundancy to prevent data loss.
- **Performance**: Offloads file handling from the main application server, reducing load times.

This cloud storage integration enhances the platform's ability to securely store and manage educational content while ensuring accessibility across devices.


# **User Interface and Experience Design**
This section provides an overview of the user interface pages available in the personalized learning platform. It describes the functionalities offered on each page, including course management, assignments, grading, and materials. The platform ensures a structured and intuitive navigation experience for both students and teachers, allowing them to efficiently access and manage educational content.  

## **User Registration and Login**
- **User registration**: Users can sign up by providing a username, first name, last name, email, password (with confirmation), and role (teacher or student).
- **User login**: Users can log in with their username and password.
- **Switch between login and registration**: Users can navigate between the registration and login pages.

## **Dashboard**
- **View courses**: Users can see a list of courses they are enrolled in or teaching.
- **Filter courses**: Options to filter by all courses, active courses, or unstarted courses.
- **Navigate to a course**: Clicking a course redirects to its home page.
- **Create a course (Teachers only)**: Teachers can create new courses.

## **Course Management**
- **Navigation menu**: Access different sections of the course, including home, assignments, people, materials, and grades.
- **View course details**: Display course name and description.
- **Edit course description (Teachers only)**: Teachers can modify the course description.

## **People Management**
- **View enrolled users**: Teachers and students can see a list of enrolled students and the course instructor.
- **Remove students (Teachers only)**: Teachers can remove students from a course.
- **Add students (Teachers only)**: Teachers can enroll students by entering their username.

## **Assignments**
- **View assignments**: Students and teachers can browse upcoming and past assignments.
- **Create assignments (Teachers only)**: Teachers can define assignments, including title, deadline, grade percentage, and handouts.
- **Edit assignments (Teachers only)**: Teachers can modify assignment details.
- **Submit assignments (Students only)**: Students can upload and submit their assignments.
- **View submitted assignments (Teachers only)**: Teachers can access submitted assignments for grading.
- **Grade assignments (Teachers only)**: Teachers can assign grades and provide comments on student submissions.
- **View grades (Students only)**: Students can see their grades and feedback.


## **Grades**
- **View overall grades (Students only)**: Students can see their grades for all assignments within a course.
- **Calculate total grade**: The system displays the cumulative grade.

## **Materials**
- **View materials**: Users can navigate through a folder-based file structure.
- **Download materials**: Users can download course materials.
- **Create folders (Teachers only)**: Teachers can create new folders.
- **Upload materials (Teachers only)**: Teachers can upload files to the course.
---

## **How These Features Fulfill the Course Requirements**

The platform is designed to fully meet the core technical requirements while implementing **advanced features** to enhance functionality and user experience.

### **Frontend Requirements**
- **React/Next.js for UI Development**: The platform uses **Next.js** to build an interactive and dynamic user experience.
- **Tailwind CSS for Styling**: A utility-first CSS framework ensures responsive and modern design.
- **shadcn/ui for Components**: Prebuilt components for buttons, forms, and modals enhance UI consistency.
- **Responsive Design**: The UI is fully optimized for different screen sizes to support mobile and desktop users.

### **Data Storage Requirements**
- **PostgreSQL for Relational Data**: Prisma ORM is used to manage course data, user authentication, assignments, and submissions.
- **Cloud Storage for File Handling**: An external cloud storage service (e.g., AWS S3, Firebase, or Google Cloud Storage) is used for **storing assignment submissions and course materials**, ensuring scalability.

### **Chosen Architecture Approach**
The project follows **Option A: Next.js Full-Stack**, implementing:
- **Next.js 13+ with App Router** for a **modern, server-driven architecture**.
- **Server Components** to handle data fetching and processing efficiently.
- **API Routes** to manage **CRUD operations** for users, courses, and assignments.
- **Server Actions for Mutations**, ensuring smooth database updates and user interactions.

### **Advanced Features**
- **User Authentication & Authorization**: 
  - Role-based authentication (`Teacher` vs. `Student`).
- **File Handling and Processing**:
  - Cloud storage integration for file uploads.
  - Pre-signed URL handling for secure file access.
  - Automatic file deletion upon course withdrawal.

This implementation ensures the platform meets **all core requirements**.


---
## **Discussion of Project Scope and Feasibility**

To ensure successful completion within the given timeframe, we have **sharpened the project scope** to focus on the **essential core features**, including:

- **User Authentication**: Secure registration and login with role-based access control.
- **Course Creation and Management**: Teachers can create, modify, and manage courses, while students can enroll.
- **Assignments**: Teachers can create assignments, students can submit solutions, and grading functionality is supported.
- **Course Materals**: Teachers can upload course materials to the platform.
- **Calendar Integration**: Students can view upcoming assignment deadlines directly within the platform.

By narrowing the scope to these key functionalities, we ensure that the platform remains **feasible within the timeframe** while maintaining a structured and efficient development process.





