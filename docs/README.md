# Personal Portfolio Website Documentation

## Project Overview
This project is a fully dynamic personal portfolio website designed to showcase skills, projects, work experience, education, and more. The website will be managed through an admin panel, allowing for easy updates and content management.

## Main Requirements
### 1. General
- The website must be fully dynamic, with no static or hard-coded content.
- All displayed content must be retrieved from a database and managed through an admin panel.
- The website must be responsive and function properly on desktop, tablet, and mobile devices.
- The website must be hosted online (local-only projects are not acceptable).
- The website must support two languages (bilingual), with the ability to switch languages.

### 2. Admin Functionality
- A secure admin login system must be implemented.
- After login, the admin must have access to a dashboard.
- From the dashboard, the admin must be able to:
  - Add, edit, and delete:
    - Skills
    - Projects
    - Work experience
    - Education
    - Resume
    - Contact information
    - Hobbies
- All changes made by the admin must be reflected immediately on the public website.

### 3. Public Pages
- Portfolio pages displaying:
  - Skills
  - Projects
  - Work experience
  - Education
  - Resume (be able to download the CV)
  - Hobbies
- Contact Page:
  - Users must be able to send messages directly through a contact form.
  - Messages should be stored in the database and accessible by the admin.

### 4. Testimonials
- A testimonial page where users can submit testimonials.
- Testimonials must not be published automatically.
- The admin must be able to:
  - Accept (approve) testimonials
  - Reject testimonials
  - Delete testimonials
- Only approved testimonials should be visible to the public.

### 5. Technical Expectations
- Proper authentication and authorization for admin access.
- Clean UI/UX design.
- Secure handling of user input (validation and sanitization).
- Clear separation between admin and public views.

## Software Stack
1. **Frontend:** Next.js (React)
2. **Backend:** Next.js (API Routes / Server Actions)
3. **Authentication:** Better Auth
4. **Database:** PostgreSQL
5. **Deployment:** DigitalOcean
6. **Containerization:** Docker
7. **Styling:** Tailwind CSS 
8. **NPM:** Node Package Manager
9. **Version Control:** Git 
10. **IDE:** VS Code
11. **API Testing:** Postman

## Conclusion
This documentation serves as a guide for the development of the personal portfolio website, outlining the main requirements, software stack, and technical expectations. It will help ensure that the project remains organized and focused on delivering a high-quality user experience.