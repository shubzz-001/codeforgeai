package com.shubham.codeforgeai.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;

    private final String AI_URL = "http://localhost:8000/explain";

    public String explainCode(String code) {

        Map<String, String> request = new HashMap<>();
        request.put("code", code);

        Map response = restTemplate.postForObject(AI_URL, request, Map.class);

        return response.get("explanation").toString();
    }

}
