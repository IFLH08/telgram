package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;
    @Autowired
    private ProyectoRepository proyectoRepository;

    @GetMapping
    public List<Sprint> getAll() {
        return sprintRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getById(@PathVariable Long id) {
        return sprintRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Sprint sprint) {
        try {
            resolveProyecto(sprint);
            validateSprint(sprint);
            return ResponseEntity.ok(sprintRepository.save(sprint));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Sprint sprintInfo) {
        return sprintRepository.findById(id).map(sprint -> {
            try {
                sprint.setNombre(sprintInfo.getNombre());
                sprint.setFechaInicio(sprintInfo.getFechaInicio());
                sprint.setFechaFin(sprintInfo.getFechaFin());
                sprint.setProyecto(sprintInfo.getProyecto());
                resolveProyecto(sprint);
                validateSprint(sprint);
                return ResponseEntity.ok(sprintRepository.save(sprint));
            } catch (IllegalArgumentException error) {
                return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    private void resolveProyecto(Sprint sprint) {
        if (sprint.getProyecto() != null && sprint.getProyecto().getIdProyecto() != null) {
            sprint.setProyecto(proyectoRepository.findById(sprint.getProyecto().getIdProyecto()).orElse(null));
        }
    }

    private void validateSprint(Sprint sprint) {
        if (sprint.getNombre() == null || sprint.getNombre().isBlank()) {
            throw new IllegalArgumentException("El sprint necesita nombre.");
        }
        if (sprint.getProyecto() == null) {
            throw new IllegalArgumentException("El sprint necesita un proyecto existente en la base de datos.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (sprintRepository.existsById(id)) {
            sprintRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
