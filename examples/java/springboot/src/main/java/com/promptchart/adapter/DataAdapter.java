package com.promptchart.adapter;

import com.promptchart.model.ChartData;
import com.promptchart.model.ChartIntent;
import java.util.List;

public interface DataAdapter {
    List<String> getAvailableDatasets();
    List<String> getAvailableMetrics(String dataset);
    List<String> getAvailableDimensions(String dataset);
    ChartData executeQuery(ChartIntent intent);
}
