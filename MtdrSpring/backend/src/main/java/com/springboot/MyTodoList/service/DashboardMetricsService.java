package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardMetricsService {
    private final TareaRepository tareaRepository;

    public DashboardMetricsService(TareaRepository tareaRepository) {
        this.tareaRepository = tareaRepository;
    }

    public List<DashboardSprintDeveloperMetricDTO> getSprintDeveloperMetrics() {
        return tareaRepository.findSprintDeveloperMetrics();
    }
}
