package com.promptchart.model;

import java.util.Map;

public record ChartRequest(
    String prompt,
    Map<String, Object> context
) {}
