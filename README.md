https://www.canva.com/design/DAG7Ug0g8SE/sWtF6hIbjp1lNv7ra0aN9w/edit?utm_content=DAG7Ug0g8SE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

FLUJO DE TRABAJO: 
* Que cada quien tenga en su branch la versión más actualizada de la rama main del proyecto.
* Que cada quien implemente sus features en su propia branch y haga pruebas locales con Docker. 
* Que cada quien haga un build y deploy con base a su propia branch (usando la cuenta OCI de Ian) para validar que el proyecto se despliega desde OCI con las nuevas features funcionando correctamente.
* Hacer push a la rama 'main'.

Nota: Cada vez que alguien haga push al main, debe informarle a los demás miembros del equipo para que éstos hagan pull a los cambios hechos por la otra persona. 
Nota 2: En el archivo application.properties se deben modificar los datos de telegram para poder hacer pruebas en las cuentas individuales del chatbot (no hay ningún otro archivo que se deba modificar). 
Nota 3: Si alguien tiene problemas con sus pruebas locales debido a una actualización/push en la rama main, entonces será necesario comunicarse con el responsable de la actualización/push de la rama main para no entorpecer el trabajo de los demás.

COMANDOS PARA CORRER DOCKER CON ATP 

instalar pnpm dentro de la carpeta frontend 

Para corer el frontend localmente (sin backend):
pnpm run dev 
pnpm run dev:backend


Para correrlo localmente conectado con la ATP:

cd C:\Users\sborb\Desktop\IAN_OCI\telgram\MtdrSpring\backend

$env:JAVA_HOME='C:\Program Files\Java\jdk-22'
.\mvnw.cmd -DskipTests package

docker build -t todolistapp-springboot:0.1 .

docker run --rm -p 8080:8080 `
  -e db_user="EQUIPO82" `
  -e dbpassword="None00010001" `
  todolistapp-springboot:0.1

