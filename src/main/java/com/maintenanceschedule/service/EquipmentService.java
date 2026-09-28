package com.maintenanceschedule.service;

import com.maintenanceschedule.entity.Equipment;
import com.maintenanceschedule.repository.EquipmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public Equipment createEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
    }

    public Equipment updateEquipment(Long id, Equipment equipment) {
        getEquipmentById(id);
        equipment.setId(id);
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Long id) {
        getEquipmentById(id);
        equipmentRepository.deleteById(id);
    }
}