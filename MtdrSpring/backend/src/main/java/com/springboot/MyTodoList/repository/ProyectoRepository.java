package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    boolean existsByCodigoAcceso(String codigoAcceso);

    @Query("SELECT COALESCE(MAX(p.idProyecto), 0) FROM Proyecto p")
    Long findMaxIdProyecto();
}
