package com.shubham.codeforgeai.dto;

import com.shubham.codeforgeai.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignUpRequest {

    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

}
