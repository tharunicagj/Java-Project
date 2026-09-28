package com.maintenanceschedule.repository;

import com.maintenanceschedule.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
}