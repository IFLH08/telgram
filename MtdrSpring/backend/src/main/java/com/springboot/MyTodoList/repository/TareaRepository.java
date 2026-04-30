package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO;
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

    // Punto 6: Calcular KPI de porcentaje de tareas completadas por cada Sprint
    @Query("SELECT new com.springboot.MyTodoList.dto.SprintKpiResponse(s.idSprint, s.nombre, COUNT(t), SUM(CASE WHEN UPPER(e.nombreEstado) = 'COMPLETADA' OR UPPER(e.nombreEstado) = 'DONE' OR UPPER(e.nombreEstado) = 'COMPLETED' THEN 1L ELSE 0L END)) " +
           "FROM Sprint s " +
           "LEFT JOIN Tarea t ON t.sprint.idSprint = s.idSprint " +
           "LEFT JOIN t.estado e " +
           "GROUP BY s.idSprint, s.nombre " +
           "ORDER BY s.idSprint DESC")
    List<com.springboot.MyTodoList.dto.SprintKpiResponse> calcularKpiSprints();

    @Query("SELECT new com.springboot.MyTodoList.dto.DashboardSprintDeveloperMetricDTO(" +
           "s.idSprint, s.nombre, u.idUsuario, u.nombre, " +
           "SUM(CASE WHEN UPPER(e.nombreEstado) = 'COMPLETADA' OR UPPER(e.nombreEstado) = 'COMPLETADO' OR UPPER(e.nombreEstado) = 'DONE' OR UPPER(e.nombreEstado) = 'COMPLETED' THEN 1L ELSE 0L END), " +
           "COALESCE(SUM(t.horasReales), 0.0)) " +
           "FROM Tarea t " +
           "JOIN t.sprint s " +
           "JOIN t.usuarioAsignado u " +
           "LEFT JOIN t.estado e " +
           "WHERE t.eliminada = false " +
           "GROUP BY s.idSprint, s.nombre, s.fechaInicio, u.idUsuario, u.nombre " +
           "ORDER BY s.fechaInicio ASC, s.idSprint ASC, u.nombre ASC")
    List<DashboardSprintDeveloperMetricDTO> findSprintDeveloperMetrics();
}
