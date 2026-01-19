package com.promptchart.llm;

import com.promptchart.model.ChartIntent;
import java.util.List;
import java.util.Map;

public interface LLMProvider {
    ChartIntent generateIntent(String prompt, Map<String, Map<String, List<String>>> datasets, List<String> chartTypes);
}
