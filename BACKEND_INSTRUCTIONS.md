# Spring Boot Backend - Project Management Feature

Create a complete Project Management module. The frontend is already built and expects these exact endpoints.

## What to create:

### 1. Entity: `Project.java` (package: `com.vyg.entity`)

Create a Project entity with these fields:
- id (Long, auto-generated primary key)
- name (String, not null) — the project name like "Sports", "University"
- imageName (String, nullable) — original filename of uploaded image
- imageType (String, nullable) — MIME type like "image/png"
- imageData (byte[], Lob, nullable) — the actual image binary data
- members (List<Members>, ManyToMany relationship)

The ManyToMany relationship should use a join table called `project_members` with columns `project_id` and `member_id`.

### 2. DTO: `ProjectDTO.java` (package: `com.vyg.dto`)

Fields:
- id (Long)
- name (String)
- imageName (String)
- memberCount (int) — the number of members in this project

### 3. DTO: `MoveMemberRequest.java` (package: `com.vyg.dto`)

Fields:
- memberId (Long)
- fromProjectId (Long)
- toProjectId (Long)

### 4. Repository: `ProjectRepository.java` (package: `com.vyg.repository`)

Extends JpaRepository<Project, Long>. No custom methods needed.

### 5. Service: `ProjectService.java` (package: `com.vyg.service`)

Methods to implement:

- `List<ProjectDTO> getAllProjects()` — return all projects with their member count
- `List<Members> getMembersByProject(Long projectId)` — return members belonging to a project
- `Project createProject(String name, MultipartFile image)` — create new project, save image if provided
- `Project updateProject(Long id, String name, MultipartFile image)` — update project name and optionally image
- `void deleteProject(Long id)` — delete a project
- `byte[] getProjectImage(Long projectId)` — return image data
- `String getProjectImageType(Long projectId)` — return image content type
- `void moveMember(Long memberId, Long fromProjectId, Long toProjectId)` — remove member from one project and add to another
- `void addMemberToProject(Long projectId, Long memberId)` — add a member to a project if not already in it

### 6. Controller: `ProjectController.java` (package: `com.vyg.controller`)

Base path: `/api/projects`

Endpoints:

| Method | Path | Consumes | Description |
|--------|------|----------|-------------|
| GET | `/api/projects` | — | Get all projects (returns List<ProjectDTO>) |
| GET | `/api/projects/{id}/members` | — | Get all members in a specific project |
| GET | `/api/projects/{id}/image` | — | Get project image (returns byte[] with content type header) |
| POST | `/api/projects` | multipart/form-data | Create project (params: name, image) |
| PUT | `/api/projects/{id}` | multipart/form-data | Update project (params: name, image) |
| DELETE | `/api/projects/{id}` | — | Delete a project |
| PUT | `/api/projects/move-member` | application/json | Move member between projects (body: MoveMemberRequest) |
| POST | `/api/projects/{projectId}/add-member/{memberId}` | — | Assign a member to a project |

### 7. Data Initializer: `ProjectDataInitializer.java` (package: `com.vyg.config`)

Implements ApplicationRunner. On startup, check if the projects table is empty. If empty, seed these 4 default projects:
- Sports
- University
- Art & Culture
- Media

### 8. Security Config Update

In your SecurityConfig.java, add this line to the permitAll section:

```
.requestMatchers("/api/projects/**").permitAll()
```

## Summary of all files to create:

1. `com.vyg.entity.Project` — Entity
2. `com.vyg.dto.ProjectDTO` — Response DTO
3. `com.vyg.dto.MoveMemberRequest` — Request DTO for moving members
4. `com.vyg.repository.ProjectRepository` — JPA Repository
5. `com.vyg.service.ProjectService` — Business logic
6. `com.vyg.controller.ProjectController` — REST Controller
7. `com.vyg.config.ProjectDataInitializer` — Seeds default projects on first run

## Important Notes:

- The Members entity already exists in your project. The Project entity creates a ManyToMany relationship with it.
- Use your existing `MemberRepository` in the ProjectService to find members by ID.
- The image upload uses MultipartFile — same pattern as your Nations or Branding image upload.
- The frontend sends `multipart/form-data` for create/update with fields named exactly "name" and "image".
- The move-member endpoint receives JSON body with memberId, fromProjectId, toProjectId.
- The add-member endpoint uses path variables only, no request body.
