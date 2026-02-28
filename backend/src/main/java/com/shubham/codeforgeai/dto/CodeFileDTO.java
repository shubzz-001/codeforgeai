package com.shubham.codeforgeai.dto;

public record CodeFileDTO(
        int id,
        String fileName,
        int lineCount,
        int methodCount,
        int complexityScore,
        String aiSummary,
        String aiSuggestion
) {
}
