package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.ProyectoRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    @Autowired
    private ProyectoRepository proyectoRepository;
    @Autowired
    private SprintRepository sprintRepository;

    private static final String ACCESS_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @GetMapping
    public List<Proyecto> getAll() {
        return proyectoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> getById(@PathVariable Long id) {
        return proyectoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Proyecto proyecto) {
        try {
            validateProyecto(proyecto);
            if (proyecto.getIdProyecto() == null) {
                proyecto.setIdProyecto(nextProyectoId());
            }
            if (proyecto.getCodigoAcceso() == null || proyecto.getCodigoAcceso().isBlank()) {
                proyecto.setCodigoAcceso(generateAccessCode());
            }

            Proyecto saved = proyectoRepository.save(proyecto);
            createInitialSprint(saved);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        } catch (DataIntegrityViolationException error) {
            return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
        } catch (RuntimeException error) {
            return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (proyectoRepository.existsById(id)) {
            proyectoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void validateProyecto(Proyecto proyecto) {
        if (proyecto.getNombre() == null || proyecto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El proyecto necesita nombre.");
        }
        if (proyecto.getFechaInicio() == null) {
            proyecto.setFechaInicio(LocalDateTime.now());
        }
        if (proyecto.getFechaFin() == null) {
            proyecto.setFechaFin(proyecto.getFechaInicio().plusDays(14));
        }
    }

    private void createInitialSprint(Proyecto proyecto) {
        Sprint sprint = new Sprint();
        sprint.setIdSprint(nextSprintId());
        sprint.setNombre("Sprint 1");
        sprint.setFechaInicio(proyecto.getFechaInicio());
        sprint.setFechaFin(calculateInitialSprintEnd(proyecto));
        sprint.setProyecto(proyecto);
        sprintRepository.save(sprint);
    }

    private LocalDateTime calculateInitialSprintEnd(Proyecto proyecto) {
        LocalDateTime sprintEnd = proyecto.getFechaInicio().plusDays(13);
        if (proyecto.getFechaFin() != null && sprintEnd.isAfter(proyecto.getFechaFin())) {
            return proyecto.getFechaFin();
        }
        return sprintEnd;
    }

    private String generateAccessCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder(8);
            for (int index = 0; index < 8; index++) {
                builder.append(ACCESS_CODE_ALPHABET.charAt(RANDOM.nextInt(ACCESS_CODE_ALPHABET.length())));
            }
            code = builder.toString();
        } while (proyectoRepository.existsByCodigoAcceso(code));
        return code;
    }

    private Long nextProyectoId() {
        return proyectoRepository.findMaxIdProyecto() + 1;
    }

    private Long nextSprintId() {
        return sprintRepository.findMaxIdSprint() + 1;
    }

    private String rootMessage(Throwable error) {
        Throwable current = error;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current.getMessage() == null ? "No se pudo guardar el proyecto." : current.getMessage();
    }
}
