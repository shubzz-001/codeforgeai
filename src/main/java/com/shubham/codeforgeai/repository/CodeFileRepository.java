package com.shubham.codeforgeai.repository;

import com.shubham.codeforgeai.model.CodeFile;
import com.shubham.codeforgeai.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeFileRepository extends JpaRepository<CodeFile, Long> {

    List<CodeFile> findByProject(Project project);

}
