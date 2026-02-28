package com.shubham.codeforgeai.service;

import com.shubham.codeforgeai.ai.AiService;
import com.shubham.codeforgeai.dto.CodeFileDTO;
import com.shubham.codeforgeai.dto.ProjectSummaryDTO;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final AiService aiService;

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
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        calculateProjectMetrics(savedProject);
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

                    System.out.println("Found " + path);
                    try {
                        String content = Files.readString(path);
                        int lines = content.split("\r\n|\r|\n").length;

                        int methodCount = Math.toIntExact(content.lines()
                                .filter(line -> line.trim().matches(".*\\b(public|private|protected)\\b.*\\(.*\\).*\\{?"))
                                .count());

                        int classCount = Math.toIntExact(content.lines()
                                .filter(line -> line.contains("class "))
                                .count());

                        int complexity = Math.toIntExact(content.lines()
                                .filter(line -> line.contains("if") ||
                                        line.contains("for") ||
                                        line.contains("while") ||
                                        line.contains("case") ||
                                        line.contains("&&") ||
                                        line.contains("||"))
                                .count());

                        CodeFile codeFile = new CodeFile();
                        codeFile.setFileName(path.getFileName().toString());
                        codeFile.setFilePath(path.toString());
                        codeFile.setContent(content);
                        codeFile.setLineCount(lines);
                        codeFile.setMethodCount(methodCount);
                        codeFile.setClassCount(classCount);
                        codeFile.setComplexityScore(complexity);
                        codeFile.setProject(project);

                        Map response = aiService.analyzeCode(content);

                        codeFile.setAiSummary(response.get("summary").toString());
                        codeFile.setAiSuggestion(response.get("suggestion").toString());

                        codeFileRepository.save(codeFile);

                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });

    }

    private void calculateProjectMetrics(Project project) {

        List<CodeFile> files = codeFileRepository.findByProject(project);
        int totalLines = files.stream().mapToInt(CodeFile::getLineCount).sum();
        int totalMethods = files.stream().mapToInt(CodeFile::getMethodCount).sum();
        int totalClasses = files.stream().mapToInt(CodeFile::getClassCount).sum();
        int totalComplexity = files.stream().mapToInt(CodeFile::getComplexityScore).sum();

        double avgComplexity = files.isEmpty() ? 0 : (double) totalComplexity / files.size();

        double qualityScore = calculateQualityScore(
                totalLines,
                totalMethods,
                totalComplexity,
                avgComplexity
        );

        project.setTotalLines(totalLines);
        project.setTotalMethods(totalMethods);
        project.setTotalClasses(totalClasses);
        project.setTotalComplexity(totalComplexity);
        project.setQualityScore(qualityScore);

        projectRepository.save(project);
    }

    private double calculateQualityScore(
            int totalLines,
            int totalMethods,
            int totalComplexity,
            double avgComplexity
    ) {
        double score = 100;

        if (avgComplexity > 10) score -= 20;
        if (totalComplexity > 50) score -= 15;
        if (totalMethods == 0) score -= 10;

        return Math.max(score, 0);
    }

    public List<ProjectSummaryDTO> getProjectsByUser(String name) {
        List<Project> projects = projectRepository.findByUserEmail(name);
        List<ProjectSummaryDTO> projectSummaries = new ArrayList<>();

        for (Project project : projects) {
            ProjectSummaryDTO summaryDTO = new ProjectSummaryDTO(
                    project.getId(),
                    project.getName(),
                    project.getTotalLines(),
                    project.getTotalMethods(),
                    project.getTotalComplexity(),
                    project.getQualityScore()
            );
            projectSummaries.add(summaryDTO);
        }
        return projectSummaries;
    }

    public List<CodeFileDTO> getFiles(Long projectId) {
        List<CodeFile> files = codeFileRepository.findByProjectId(projectId);
        List<CodeFileDTO> codeFileDTOList = new ArrayList<>();

        for (CodeFile codeFile : files) {
            CodeFileDTO codeFileDTO = new CodeFileDTO(
                    codeFile.getId(),
                    codeFile.getFileName(),
                    codeFile.getLineCount(),
                    codeFile.getMethodCount(),
                    codeFile.getComplexityScore(),
                    codeFile.getAiSummary(),
                    codeFile.getAiSuggestion()
            );
            codeFileDTOList.add(codeFileDTO);
        }

        return codeFileDTOList;
    }
}
