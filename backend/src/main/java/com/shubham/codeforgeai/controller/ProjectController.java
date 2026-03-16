package com.shubham.codeforgeai.controller;

import com.shubham.codeforgeai.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            Principal principal
    ) throws IOException {
        projectService.uploadProject(file, name,description, principal.getName());
        return ResponseEntity.ok("Project uploaded Successfully");
    }

    @GetMapping("/")
    public ResponseEntity<?> getUserProjects(Principal principal) {
        return ResponseEntity.ok(
                projectService.getProjectsByUser(principal.getName())
        );
    }

    @GetMapping("/{projectId}/files")
    public ResponseEntity<?> getFiles(@PathVariable Long projectId) {
        return ResponseEntity.ok(
                projectService.getFiles(projectId)
        );
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<?> getFileContent(@PathVariable Integer fileId) {
        return ResponseEntity.ok(projectService.getFileContent(fileId));
    }

}
