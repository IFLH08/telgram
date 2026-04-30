package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.EstadoTarea;
import com.springboot.MyTodoList.model.Prioridad;
import com.springboot.MyTodoList.repository.TareaRepository;
import com.springboot.MyTodoList.repository.EstadoTareaRepository;
import com.springboot.MyTodoList.repository.PrioridadRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;
    @Autowired
    private EstadoTareaRepository estadoTareaRepository;
    @Autowired
    private PrioridadRepository prioridadRepository;
    @Autowired
    private SprintRepository sprintRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Tarea> getAll() {
        return tareaRepository.findAll();
    }

    @GetMapping("/reporte/sprint-actual")
    public ResponseEntity<List<com.springboot.MyTodoList.dto.TareaSprintDTO>> getTareasSprintActual() {
        List<com.springboot.MyTodoList.dto.TareaSprintDTO> tareas = tareaRepository.findTareasSprintActual();
        return ResponseEntity.ok(tareas);
    }

    @GetMapping("/reporte/kpi-avances")
    public ResponseEntity<List<com.springboot.MyTodoList.dto.SprintKpiResponse>> getKpiAvances() {
        List<com.springboot.MyTodoList.dto.SprintKpiResponse> kpi = tareaRepository.calcularKpiSprints();
        return ResponseEntity.ok(kpi);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tarea> getById(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Tarea> getByUsuarioAsignado(@PathVariable Long usuarioId) {
        return tareaRepository.findByUsuarioAsignadoIdUsuario(usuarioId);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tarea tarea) {
        try {
            if (tarea.getFechaCreacion() == null) {
                tarea.setFechaCreacion(OffsetDateTime.now());
            }
            resolveRelations(tarea);
            validateRequiredRelations(tarea);
            return ResponseEntity.ok(tareaRepository.save(tarea));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tarea> update(@PathVariable Long id, @RequestBody Tarea tareaInfo) {
        return tareaRepository.findById(id).map(tarea -> {
            tarea.setNombre(tareaInfo.getNombre());
            tarea.setDescripcion(tareaInfo.getDescripcion());
            tarea.setHorasEstimadas(tareaInfo.getHorasEstimadas());
            tarea.setHorasReales(tareaInfo.getHorasReales());
            tarea.setEstado(tareaInfo.getEstado());
            tarea.setFechaEntrega(tareaInfo.getFechaEntrega());
            tarea.setPuntosHistoria(tareaInfo.getPuntosHistoria());
            tarea.setSprint(tareaInfo.getSprint());
            tarea.setUsuarioAsignado(tareaInfo.getUsuarioAsignado());
            tarea.setPrioridad(tareaInfo.getPrioridad());
            resolveRelations(tarea);
            validateRequiredRelations(tarea);
            return ResponseEntity.ok(tareaRepository.save(tarea));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void resolveRelations(Tarea tarea) {
        if (tarea.getEstado() != null) {
            EstadoTarea estado = null;
            if (tarea.getEstado().getIdEstado() != null) {
                estado = estadoTareaRepository.findById(tarea.getEstado().getIdEstado()).orElse(null);
            }
            if (estado == null && tarea.getEstado().getNombreEstado() != null) {
                estado = estadoTareaRepository.findByNombreEstado(tarea.getEstado().getNombreEstado());
                if (estado == null) {
                    estado = estadoTareaRepository.save(tarea.getEstado());
                }
            }
            tarea.setEstado(estado);
        }

        if (tarea.getPrioridad() != null) {
            Prioridad prioridad = null;
            if (tarea.getPrioridad().getIdPrioridad() != null) {
                prioridad = prioridadRepository.findById(tarea.getPrioridad().getIdPrioridad()).orElse(null);
            }
            if (prioridad == null && tarea.getPrioridad().getNombre() != null) {
                prioridad = prioridadRepository.findByNombre(tarea.getPrioridad().getNombre());
                if (prioridad == null) {
                    prioridad = prioridadRepository.save(tarea.getPrioridad());
                }
            }
            tarea.setPrioridad(prioridad);
        }

        if (tarea.getSprint() != null && tarea.getSprint().getIdSprint() != null) {
            tarea.setSprint(sprintRepository.findById(tarea.getSprint().getIdSprint()).orElse(null));
        }

        if (tarea.getUsuarioAsignado() != null && tarea.getUsuarioAsignado().getIdUsuario() != null) {
            tarea.setUsuarioAsignado(usuarioRepository.findById(tarea.getUsuarioAsignado().getIdUsuario()).orElse(null));
        }
    }

    private void validateRequiredRelations(Tarea tarea) {
        if (tarea.getNombre() == null || tarea.getNombre().isBlank()) {
            throw new IllegalArgumentException("La tarea necesita nombre.");
        }
        if (tarea.getSprint() == null) {
            throw new IllegalArgumentException("La tarea necesita un sprint existente en la base de datos.");
        }
        if (tarea.getUsuarioAsignado() == null) {
            throw new IllegalArgumentException("La tarea necesita un responsable existente en la base de datos.");
        }
        if (tarea.getEstado() == null) {
            throw new IllegalArgumentException("La tarea necesita un estado valido.");
        }
        if (tarea.getPrioridad() == null) {
            throw new IllegalArgumentException("La tarea necesita una prioridad valida.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (tareaRepository.existsById(id)) {
            tareaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
