package com.shubham.codeforgeai.dto;

public record ProjectSummaryDTO(
        Long id,
        String name,
        int totalLines,
        int totalMethods,
        int totalComplexity,
        double qualityScore
) {
}
