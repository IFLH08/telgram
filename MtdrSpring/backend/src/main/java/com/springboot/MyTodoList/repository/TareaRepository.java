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
    @Query(value = "SELECT t.ID_TAREA as idTarea, t.NOMBRE as nombreTarea, " +
            "t.DESCRIPCION as descripcion, e.NOMBRE_ESTADO as estado, " +
            "u.NOMBRE as usuarioAsignado, s.NOMBRE as nombreSprint " +
            "FROM TAREAS t " +
            "JOIN USUARIOS u ON t.ID_USUARIO_ASIGNADO = u.ID_USUARIO " +
            "JOIN ESTADOS_TAREA e ON t.ID_ESTADO = e.ID_ESTADO " +
            "JOIN SPRINTS s ON t.ID_SPRINT = s.ID_SPRINT " +
            "WHERE t.ID_SPRINT = (SELECT ID_SPRINT FROM SPRINTS ORDER BY FECHA_INICIO DESC FETCH FIRST 1 ROWS ONLY)", nativeQuery = true)
    List<TareaSprintDTO> findTareasSprintActual();
}
