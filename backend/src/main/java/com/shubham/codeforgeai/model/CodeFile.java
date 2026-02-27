package com.shubham.codeforgeai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "code_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fileName;

    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String content;

    private int lineCount;

    private int methodCount;

    private int classCount;

    private int complexityScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
