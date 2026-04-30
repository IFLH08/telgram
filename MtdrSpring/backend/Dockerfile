FROM openjdk:22-jdk
#COPY pom.xml /tmp/
#COPY src /tmp/src/
WORKDIR /tmp/
EXPOSE 8080
COPY wallet/ /tmp/wallet/
COPY target/MyTodoList-0.0.1-SNAPSHOT.jar MyTodoList.jar

ENV driver_class_name="oracle.jdbc.OracleDriver"
ENV db_url="jdbc:oracle:thin:@practice_tp?TNS_ADMIN=/tmp/wallet"

ENTRYPOINT ["java","-jar","MyTodoList.jar"]
