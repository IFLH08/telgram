package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

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
    public Sprint create(@RequestBody Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> update(@PathVariable Long id, @RequestBody Sprint sprintInfo) {
        return sprintRepository.findById(id).map(sprint -> {
            sprint.setNombre(sprintInfo.getNombre());
            sprint.setFechaInicio(sprintInfo.getFechaInicio());
            sprint.setFechaFin(sprintInfo.getFechaFin());
            return ResponseEntity.ok(sprintRepository.save(sprint));
        }).orElse(ResponseEntity.notFound().build());
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
