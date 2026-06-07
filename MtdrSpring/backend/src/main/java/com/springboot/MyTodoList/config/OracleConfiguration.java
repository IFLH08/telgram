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
        OracleDataSource ds = new OracleDataSource();
        String url = firstNonBlank(env.getProperty("spring.datasource.url"), env.getProperty("DB_URL"),
                env.getProperty("db_url"), dbSettings.getUrl());
        String username = firstNonBlank(env.getProperty("spring.datasource.username"), env.getProperty("DB_USER"),
                env.getProperty("db_user"), dbSettings.getUsername());
        String password = firstNonBlank(env.getProperty("spring.datasource.password"), env.getProperty("DB_PASSWORD"),
                env.getProperty("dbpassword"), dbSettings.getPassword());

        ds.setURL(url);
        logger.info("Using URL: " + url);
        ds.setUser(username);
        logger.info("Using Username " + username);
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

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
