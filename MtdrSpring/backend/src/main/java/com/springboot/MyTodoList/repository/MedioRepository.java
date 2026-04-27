package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Medio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedioRepository extends JpaRepository<Medio, Long> {
}
