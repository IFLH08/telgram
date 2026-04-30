package com.springboot.MyTodoList.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRouteController {
    @RequestMapping({
            "/dashboard",
            "/dashboard/",
            "/tequi",
            "/tequi/",
            "/tareas",
            "/tareas/",
            "/proyectos",
            "/proyectos/",
            "/codigos",
            "/codigos/"
    })
    public String forwardSpaRoute() {
        return "forward:/index.html";
    }
}
