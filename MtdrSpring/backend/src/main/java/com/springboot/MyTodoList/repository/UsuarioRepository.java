package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByTelegramId(Long telegramId);

    Optional<Usuario> findByNombreIgnoreCase(String nombre);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    @Query("SELECT COALESCE(MAX(u.idUsuario), 0) FROM Usuario u")
    Long findMaxIdUsuario();

    List<Usuario> findByNombreContainingIgnoreCaseOrUsernameContainingIgnoreCase(String nombre, String username);
}
