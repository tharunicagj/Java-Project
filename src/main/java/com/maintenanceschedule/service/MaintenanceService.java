package com.maintenanceschedule.service;

import com.maintenanceschedule.entity.Maintenance;
import com.maintenanceschedule.repository.MaintenanceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    public Maintenance createMaintenance(Maintenance maintenance) {
        return maintenanceRepository.save(maintenance);
    }

    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    public Maintenance updateMaintenance(Long id, Maintenance maintenance) {
        findMaintenanceById(id);
        maintenance.setId(id);
        return maintenanceRepository.save(maintenance);
    }

    public void deleteMaintenance(Long id) {
        findMaintenanceById(id);
        maintenanceRepository.deleteById(id);
    }

    private Maintenance findMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found"));
    }
}



