package com.springboot.MyTodoList.config;


import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;


import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.Optional;
///*
//    This class grabs the appropriate values for OracleDataSource,
//    The method that uses env, grabs it from the environment variables set
//    in the docker container. The method that uses dbSettings is for local testing
//    @author: peter.song@oracle.com
// */
//
//
@Configuration
public class OracleConfiguration {
    Logger logger = LoggerFactory.getLogger(DbSettings.class);
    @Autowired
    private DbSettings dbSettings;
    @Autowired
    private Environment env;
    @Bean
    public DataSource dataSource() throws SQLException{
        String driver = firstConfiguredValue(
                env.getProperty("driver_class_name"),
                dbSettings.getDriver_class_name(),
                "oracle.jdbc.OracleDriver");
        String url = firstConfiguredValue(env.getProperty("db_url"), dbSettings.getUrl(), null);
        String user = firstConfiguredValue(env.getProperty("db_user"), dbSettings.getUsername(), null);
        String password = firstConfiguredValue(env.getProperty("dbpassword"), dbSettings.getPassword(), "");

        if (url == null || url.isBlank()) {
            throw new SQLException("Oracle datasource URL is not configured. Set db_url or spring.datasource.url.");
        }
        if (user == null || user.isBlank()) {
            throw new SQLException("Oracle datasource username is not configured. Set db_user or spring.datasource.username.");
        }

        OracleDataSource ds = new OracleDataSource();
        ds.setDriverType(driver);
        logger.info("Using Driver " + driver);
        ds.setURL(url);
        logger.info("Using URL: " + url);
        ds.setUser(user);
        logger.info("Using Username " + user);
        ds.setPassword(password);
//        For local testing
//        ds.setDriverType(dbSettings.getDriver_class_name());
//        logger.info("Using Driver " + dbSettings.getDriver_class_name());
//        ds.setURL(dbSettings.getUrl());
//        logger.info("Using URL: " + dbSettings.getUrl());
//        ds.setUser(dbSettings.getUsername());
//        logger.info("Using Username: " + dbSettings.getUsername());
//        ds.setPassword(dbSettings.getPassword());
        return ds;
    }

    private String firstConfiguredValue(String... values) {
        return Optional.ofNullable(values)
                .stream()
                .flatMap(java.util.Arrays::stream)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }
}
