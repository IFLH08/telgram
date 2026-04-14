package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.EstadoTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoTareaRepository extends JpaRepository<EstadoTarea, Long> {
    EstadoTarea findByNombreEstado(String nombreEstado);
}
