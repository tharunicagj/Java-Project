package com.maintenanceschedule.controller;

import com.maintenanceschedule.entity.Maintenance;
import com.maintenanceschedule.service.MaintenanceService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public Maintenance createMaintenance(@RequestBody Maintenance maintenance) {
        return maintenanceService.createMaintenance(maintenance);
    }

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @PutMapping("/{id}")
    public Maintenance updateMaintenance(@PathVariable Long id, @RequestBody Maintenance maintenance) {
        return maintenanceService.updateMaintenance(id, maintenance);
    }

    @DeleteMapping("/{id}")
    public void deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
    }
}