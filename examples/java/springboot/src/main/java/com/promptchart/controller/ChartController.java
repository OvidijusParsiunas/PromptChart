package com.promptchart.controller;

import com.promptchart.model.ChartRequest;
import com.promptchart.model.ChartResponse;
import com.promptchart.service.IntentResolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ChartController {

    private final IntentResolverService resolverService;

    public ChartController(IntentResolverService resolverService) {
        this.resolverService = resolverService;
    }

    @PostMapping("/api/chart")
    public ResponseEntity<?> generateChart(@RequestBody ChartRequest request) {
        if (request.prompt() == null || request.prompt().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Missing or invalid prompt", "code", "INVALID_REQUEST"));
        }

        try {
            ChartResponse response = resolverService.resolve(request.prompt());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage(), "code", "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "timestamp", Instant.now().toString()));
    }
}
