package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
import com.springboot.MyTodoList.model.DashboardMetric;
import com.springboot.MyTodoList.repository.DashboardMetricRepository;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.service.DashboardMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardMetricsController {
    private final DashboardMetricsService dashboardMetricsService;
    private final DashboardMetricRepository dashboardMetricRepository;
    private final ProyectoRepository proyectoRepository;
    private final SprintRepository sprintRepository;

    public DashboardMetricsController(
            DashboardMetricsService dashboardMetricsService,
            DashboardMetricRepository dashboardMetricRepository,
            ProyectoRepository proyectoRepository,
            SprintRepository sprintRepository) {
        this.dashboardMetricsService = dashboardMetricsService;
        this.dashboardMetricRepository = dashboardMetricRepository;
        this.proyectoRepository = proyectoRepository;
        this.sprintRepository = sprintRepository;
    }

    @GetMapping("/sprint-developer-metrics")
    public List<DashboardSprintDeveloperMetricDTO> getSprintDeveloperMetrics(
            @RequestParam(required = false) Long sprintId,
            @RequestParam(required = false) Long developerId) {
        if (sprintId == null && developerId == null) {
            return dashboardMetricsService.getSprintDeveloperMetrics();
        }
        return dashboardMetricsService.getSprintDeveloperMetricsFiltered(sprintId, developerId);
    }

    @GetMapping("/metrics")
    public List<DashboardMetric> getMetrics() {
        return dashboardMetricRepository.findAll();
    }

    @GetMapping("/metrics/{id}")
    public ResponseEntity<DashboardMetric> getMetricById(@PathVariable Long id) {
        return dashboardMetricRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/metrics")
    public ResponseEntity<?> createMetric(@RequestBody DashboardMetric metric) {
        try {
            if (metric.getFechaCalculo() == null) {
                metric.setFechaCalculo(OffsetDateTime.now());
            }
            resolveMetricRelations(metric);
            validateMetric(metric);
            return ResponseEntity.ok(dashboardMetricRepository.save(metric));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/metrics/{id}")
    public ResponseEntity<?> updateMetric(@PathVariable Long id, @RequestBody DashboardMetric metricInfo) {
        return dashboardMetricRepository.findById(id).map(metric -> {
            try {
                metric.setProyecto(metricInfo.getProyecto());
                metric.setSprint(metricInfo.getSprint());
                metric.setNombreKpi(metricInfo.getNombreKpi());
                metric.setValor(metricInfo.getValor());
                metric.setFechaCalculo(metricInfo.getFechaCalculo());
                if (metric.getFechaCalculo() == null) {
                    metric.setFechaCalculo(OffsetDateTime.now());
                }
                resolveMetricRelations(metric);
                validateMetric(metric);
                return ResponseEntity.ok(dashboardMetricRepository.save(metric));
            } catch (IllegalArgumentException error) {
                return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/metrics/{id}")
    public ResponseEntity<Void> deleteMetric(@PathVariable Long id) {
        if (dashboardMetricRepository.existsById(id)) {
            dashboardMetricRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void resolveMetricRelations(DashboardMetric metric) {
        if (metric.getProyecto() != null && metric.getProyecto().getIdProyecto() != null) {
            metric.setProyecto(proyectoRepository.findById(metric.getProyecto().getIdProyecto()).orElse(null));
        }
        if (metric.getSprint() != null && metric.getSprint().getIdSprint() != null) {
            metric.setSprint(sprintRepository.findById(metric.getSprint().getIdSprint()).orElse(null));
        }
    }

    private void validateMetric(DashboardMetric metric) {
        if (metric.getProyecto() == null) {
            throw new IllegalArgumentException("La metrica necesita un proyecto existente en la base de datos.");
        }
        if (metric.getNombreKpi() == null || metric.getNombreKpi().isBlank()) {
            throw new IllegalArgumentException("La metrica necesita nombreKpi.");
        }
        if (metric.getValor() == null) {
            throw new IllegalArgumentException("La metrica necesita valor.");
        }
    }
}
