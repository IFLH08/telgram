package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.RagDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {
    boolean existsByTitulo(String titulo);

    List<RagDocument> findAllByOrderByActualizadoEnDesc();
}
