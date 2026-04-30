package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
import com.springboot.MyTodoList.service.DashboardMetricsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardMetricsController {
    private final DashboardMetricsService dashboardMetricsService;

    public DashboardMetricsController(DashboardMetricsService dashboardMetricsService) {
        this.dashboardMetricsService = dashboardMetricsService;
    }

    @GetMapping("/sprint-developer-metrics")
    public List<DashboardSprintDeveloperMetricDTO> getSprintDeveloperMetrics() {
        return dashboardMetricsService.getSprintDeveloperMetrics();
    }
}
