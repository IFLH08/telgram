package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    @Query("SELECT COALESCE(MAX(s.idSprint), 0) FROM Sprint s")
    Long findMaxIdSprint();

    List<Sprint> findByProyectoIdProyectoOrderByFechaInicioAsc(Long proyectoId);
}
