FROM openjdk:22-jdk
#COPY pom.xml /tmp/
#COPY src /tmp/src/
WORKDIR /tmp/
EXPOSE 8080
COPY target/*.jar MyTodoList.jar
ENTRYPOINT ["java","-jar","MyTodoList.jar"]