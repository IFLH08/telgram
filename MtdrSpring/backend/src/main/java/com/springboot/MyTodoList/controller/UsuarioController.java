package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.model.Rol;
import com.springboot.MyTodoList.repository.RolRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolRepository rolRepository;

    @GetMapping
    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telegram/{telegramId}")
    public ResponseEntity<Usuario> getByTelegramId(@PathVariable Long telegramId) {
        return usuarioRepository.findByTelegramId(telegramId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String nombre = credenciales.get("nombre");
        String contrasena = credenciales.get("contrasena");

        if (nombre == null || nombre.isBlank() || contrasena == null || contrasena.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nombre y contrasena son obligatorios."));
        }

        return usuarioRepository.findByNombreIgnoreCase(nombre.trim())
                .or(() -> usuarioRepository.findByUsernameIgnoreCase(nombre.trim()))
                .filter(usuario -> contrasena.equals(usuario.getContrasena()))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Credenciales invalidas.")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Usuario usuario) {
        try {
            if (usuario.getFechaRegistro() == null) {
                usuario.setFechaRegistro(OffsetDateTime.now());
            }
            if (usuario.getIdUsuario() == null) {
                usuario.setIdUsuario(usuarioRepository.findMaxIdUsuario() + 1);
            }
            resolveRol(usuario);
            validateUsuario(usuario);
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        }
    }

    private void resolveRol(Usuario usuario) {
        if (usuario.getRol() == null) {
            return;
        }

        Rol rol = null;
        if (usuario.getRol().getIdRol() != null) {
            rol = rolRepository.findById(usuario.getRol().getIdRol()).orElse(null);
        }
        if (rol == null && usuario.getRol().getNombreRol() != null) {
            rol = rolRepository.findByNombreRol(usuario.getRol().getNombreRol());
        }
        usuario.setRol(rol);
    }

    private void validateUsuario(Usuario usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().isBlank()) {
            throw new IllegalArgumentException("El usuario necesita nombre.");
        }
        if (usuario.getUsername() == null || usuario.getUsername().isBlank()) {
            throw new IllegalArgumentException("El usuario necesita username.");
        }
        if (usuario.getRol() == null) {
            throw new IllegalArgumentException("El usuario necesita un rol existente en la base de datos.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
