package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Prioridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrioridadRepository extends JpaRepository<Prioridad, Long> {
    Prioridad findByNombre(String nombre);
}
