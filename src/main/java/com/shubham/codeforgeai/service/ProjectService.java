package com.shubham.codeforgeai.service;

import com.shubham.codeforgeai.model.CodeFile;
import com.shubham.codeforgeai.model.Project;
import com.shubham.codeforgeai.model.User;
import com.shubham.codeforgeai.repository.CodeFileRepository;
import com.shubham.codeforgeai.repository.ProjectRepository;
import com.shubham.codeforgeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CodeFileRepository codeFileRepository;

    private final String UPLOAD_DIR = "uploads/";

    public void uploadProject(MultipartFile file, String name, String description, String email) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!file.getOriginalFilename().endsWith(".zip")) {
            throw new RuntimeException("File is not zip !! Only zip are allowed.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(()  -> new RuntimeException("User not found"));

        String uniqueFolder = UUID.randomUUID().toString();
        Path projectPath = Paths.get(UPLOAD_DIR + uniqueFolder);

        System.out.println("Scanning Path: " + projectPath.toAbsolutePath());
        try {
            Files.createDirectories(projectPath);

            Path zipPath = projectPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), zipPath);

            unzip(zipPath.toString(), projectPath.toString());

        } catch (IOException e) {
            throw new RuntimeException("File Upload Failed");
        }

        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setOriginalFileName(file.getOriginalFilename());
        project.setStoragePath(projectPath.toString());
        project.setUser(user);

        Project savedProject = projectRepository.save(project);
        scanAndStoreJavaFiles(projectPath, savedProject);
    }

    private void unzip(String zipFilePath, String destDir) throws IOException {

        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFilePath))) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {
                Path newPath = Paths.get(destDir).resolve(entry.getName()).normalize();
                File newFile = newPath.toFile();

                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    new File(newFile.getParent()).mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(newFile)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
            }
        }
    }

    private void scanAndStoreJavaFiles(Path projectPath, Project project) throws IOException {

        System.out.println("Scanning Java Files");
        Files.walk(projectPath)
                .filter(path -> path.toString().endsWith(".java"))
                .forEach(path -> {

                    System.out.println("Found "+path);
                    try {
                        String content = Files.readString(path);
                        int lines = content.split("\r\n|\r|\n").length;

                        CodeFile codeFile = new CodeFile();
                        codeFile.setFileName(path.getFileName().toString());
                        codeFile.setFilePath(path.toString());
                        codeFile.setContent(content);
                        codeFile.setLineCount(lines);
                        codeFile.setProject(project);

                        codeFileRepository.save(codeFile);

                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });

    }

}
