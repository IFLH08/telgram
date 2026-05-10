package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.DashboardMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardMetricRepository extends JpaRepository<DashboardMetric, Long> {
}
