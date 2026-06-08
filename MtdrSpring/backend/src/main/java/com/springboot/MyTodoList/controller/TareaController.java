package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.EstadoTarea;
import com.springboot.MyTodoList.model.Prioridad;
import com.springboot.MyTodoList.repository.TareaRepository;
import com.springboot.MyTodoList.repository.EstadoTareaRepository;
import com.springboot.MyTodoList.repository.PrioridadRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public List<Map<String, Object>> getAll() {
        return tareaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> ResponseEntity.ok(toResponse(tarea)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Map<String, Object>> getByUsuarioAsignado(@PathVariable Long usuarioId) {
        return tareaRepository.findByUsuarioAsignadoIdUsuario(usuarioId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tarea tarea) {
        try {
            if (tarea.getFechaCreacion() == null) {
                tarea.setFechaCreacion(LocalDateTime.now());
            }
            if (tarea.getIdTarea() == null) {
                tarea.setIdTarea(nextTareaId());
            }
            resolveRelations(tarea);
            validateRequiredRelations(tarea);
            return ResponseEntity.ok(toResponse(tareaRepository.save(tarea)));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        } catch (DataIntegrityViolationException error) {
            return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
        } catch (RuntimeException error) {
            return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Tarea tareaInfo) {
        return tareaRepository.findById(id).map(tarea -> {
            try {
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
                Tarea saved = tareaRepository.save(tarea);
                if (isCompleted(saved) && tareaInfo.getHorasReales() != null) {
                    saved.setHorasReales(tareaInfo.getHorasReales());
                    saved = tareaRepository.save(saved);
                }
                return ResponseEntity.ok(toResponse(saved));
            } catch (IllegalArgumentException error) {
                return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
            } catch (DataIntegrityViolationException error) {
                return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
            } catch (RuntimeException error) {
                return ResponseEntity.badRequest().body(Map.of("error", rootMessage(error)));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    private void resolveRelations(Tarea tarea) {
        if (tarea.getEstado() != null) {
            EstadoTarea estado = null;
            if (tarea.getEstado().getIdEstado() != null) {
                estado = estadoTareaRepository.findById(tarea.getEstado().getIdEstado()).orElse(null);
            }
            String nombreEstado = normalizeEstado(tarea.getEstado().getNombreEstado());
            if (estado == null && nombreEstado != null) {
                estado = estadoTareaRepository.findByNombreEstado(nombreEstado);
                if (estado == null) {
                    tarea.getEstado().setNombreEstado(nombreEstado);
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
            String nombrePrioridad = normalizePrioridad(tarea.getPrioridad().getNombre());
            if (prioridad == null && nombrePrioridad != null) {
                prioridad = prioridadRepository.findByNombre(nombrePrioridad);
                if (prioridad == null) {
                    tarea.getPrioridad().setNombre(nombrePrioridad);
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

    private Long nextTareaId() {
        return tareaRepository.findMaxIdTarea() + 1;
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
        if (isCompleted(tarea) && (tarea.getHorasReales() == null || tarea.getHorasReales() <= 0)) {
            throw new IllegalArgumentException("Para completar la tarea debes registrar horas reales mayores a cero.");
        }
    }

    private boolean isCompleted(Tarea tarea) {
        if (tarea == null || tarea.getEstado() == null || tarea.getEstado().getNombreEstado() == null) {
            return false;
        }

        String value = tarea.getEstado().getNombreEstado().trim().toUpperCase();
        return "COMPLETED".equals(value) || "DONE".equals(value) || "COMPLETADA".equals(value) || "COMPLETADO".equals(value);
    }

    private String normalizeEstado(String nombreEstado) {
        if (nombreEstado == null || nombreEstado.isBlank()) {
            return null;
        }

        String value = nombreEstado.trim().toUpperCase();
        if ("PENDING".equals(value) || "PENDIENTE".equals(value)) {
            return "Pendiente";
        }
        if ("IN PROGRESS".equals(value) || "EN_PROGRESO".equals(value) || "EN PROGRESO".equals(value)) {
            return "En progreso";
        }
        if ("PAUSED".equals(value) || "PAUSADA".equals(value) || "PAUSADO".equals(value)) {
            return "Pausada";
        }
        if ("COMPLETED".equals(value) || "DONE".equals(value) || "COMPLETADA".equals(value) || "COMPLETADO".equals(value)) {
            return "Completada";
        }
        if ("CANCELLED".equals(value) || "CANCELED".equals(value) || "CANCELADA".equals(value) || "CANCELADO".equals(value)) {
            return "Cancelada";
        }
        return nombreEstado.trim();
    }

    private String normalizePrioridad(String nombrePrioridad) {
        if (nombrePrioridad == null || nombrePrioridad.isBlank()) {
            return null;
        }

        String value = nombrePrioridad.trim().toUpperCase();
        if ("HIGH".equals(value) || "ALTA".equals(value) || "3".equals(value)) {
            return "Alta";
        }
        if ("MEDIUM".equals(value) || "MEDIA".equals(value) || "2".equals(value)) {
            return "Media";
        }
        if ("LOW".equals(value) || "BAJA".equals(value) || "1".equals(value)) {
            return "Baja";
        }
        return nombrePrioridad.trim();
    }

    private Map<String, Object> toResponse(Tarea tarea) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idTarea", tarea.getIdTarea());
        response.put("nombre", tarea.getNombre());
        response.put("descripcion", tarea.getDescripcion());
        response.put("fechaCreacion", tarea.getFechaCreacion());
        response.put("fechaEntrega", tarea.getFechaEntrega());
        response.put("horasEstimadas", tarea.getHorasEstimadas());
        response.put("horasReales", tarea.getHorasReales());
        response.put("puntosHistoria", tarea.getPuntosHistoria());
        response.put("estado", tarea.getEstado() == null ? null : estadoResponse(tarea.getEstado()));
        response.put("sprint", tarea.getSprint() == null ? null : sprintResponse(tarea.getSprint()));
        response.put("usuarioAsignado", tarea.getUsuarioAsignado() == null ? null : usuarioResponse(tarea.getUsuarioAsignado()));
        response.put("prioridad", tarea.getPrioridad() == null ? null : prioridadResponse(tarea.getPrioridad()));
        response.put("eliminada", tarea.getEliminada());
        response.put("fechaEliminacion", tarea.getFechaEliminacion());
        response.put("fechaInicioReal", tarea.getFechaInicioReal());
        response.put("fechaFinReal", tarea.getFechaFinReal());
        return response;
    }

    private Map<String, Object> estadoResponse(EstadoTarea estado) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idEstado", estado.getIdEstado());
        response.put("nombreEstado", estado.getNombreEstado());
        return response;
    }

    private Map<String, Object> prioridadResponse(Prioridad prioridad) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idPrioridad", prioridad.getIdPrioridad());
        response.put("nombre", prioridad.getNombre());
        return response;
    }

    private Map<String, Object> sprintResponse(com.springboot.MyTodoList.model.Sprint sprint) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idSprint", sprint.getIdSprint());
        response.put("nombre", sprint.getNombre());
        response.put("fechaInicio", sprint.getFechaInicio());
        response.put("fechaFin", sprint.getFechaFin());
        response.put("proyecto", sprint.getProyecto() == null ? null : proyectoResponse(sprint.getProyecto()));
        return response;
    }

    private Map<String, Object> proyectoResponse(com.springboot.MyTodoList.model.Proyecto proyecto) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idProyecto", proyecto.getIdProyecto());
        response.put("nombre", proyecto.getNombre());
        response.put("descripcion", proyecto.getDescripcion());
        response.put("fechaInicio", proyecto.getFechaInicio());
        response.put("fechaFin", proyecto.getFechaFin());
        response.put("codigoAcceso", proyecto.getCodigoAcceso());
        return response;
    }

    private Map<String, Object> usuarioResponse(com.springboot.MyTodoList.model.Usuario usuario) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("idUsuario", usuario.getIdUsuario());
        response.put("telegramId", usuario.getTelegramId());
        response.put("nombre", usuario.getNombre());
        response.put("username", usuario.getUsername());
        return response;
    }

    private String rootMessage(Throwable error) {
        Throwable current = error;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current.getMessage() == null ? "No se pudo guardar la tarea." : current.getMessage();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return tareaRepository.findById(id).map(tarea -> {
            tarea.setEliminada(true);
            tarea.setFechaEliminacion(LocalDateTime.now());
            tareaRepository.save(tarea);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
