package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.springboot.MyTodoList.dto.TareaSprintDTO;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByUsuarioAsignadoIdUsuario(Long idUsuario);

    // Punto 5: Mostrar la tabla de tasks del SPRINT actual haciendo JOIN con
    // usuario
    @Query("SELECT t.idTarea as idTarea, t.nombre as nombreTarea, " +
           "t.descripcion as descripcion, e.nombreEstado as estado, " +
           "u.nombre as usuarioAsignado, s.nombre as nombreSprint " +
           "FROM Tarea t " +
           "LEFT JOIN t.usuarioAsignado u " +
           "LEFT JOIN t.estado e " +
           "JOIN t.sprint s " +
           "WHERE s.fechaInicio = (SELECT MAX(s2.fechaInicio) FROM Sprint s2)")
    List<TareaSprintDTO> findTareasSprintActual();
}
