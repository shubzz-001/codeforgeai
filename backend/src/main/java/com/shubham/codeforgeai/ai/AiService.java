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

    private final String AI_URL = "http://localhost:8000/analyze";

    public Map analyzeCode(String code) {

        Map<String, String> request = new HashMap<>();
        request.put("code", code);

        return restTemplate.postForObject(AI_URL, request, Map.class);
    }

}
