package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;

    @GetMapping
    public List<Tarea> getAll() {
        return tareaRepository.findAll();
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
    public Tarea create(@RequestBody Tarea tarea) {
        if (tarea.getFechaCreacion() == null) {
            tarea.setFechaCreacion(OffsetDateTime.now());
        }
        return tareaRepository.save(tarea);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tarea> update(@PathVariable Long id, @RequestBody Tarea tareaInfo) {
        return tareaRepository.findById(id).map(tarea -> {
            tarea.setNombre(tareaInfo.getNombre());
            tarea.setDescripcion(tareaInfo.getDescripcion());
            tarea.setHorasEstimadas(tareaInfo.getHorasEstimadas());
            tarea.setHorasReales(tareaInfo.getHorasReales());
            tarea.setEstado(tareaInfo.getEstado());
            return ResponseEntity.ok(tareaRepository.save(tarea));
        }).orElse(ResponseEntity.notFound().build());
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
