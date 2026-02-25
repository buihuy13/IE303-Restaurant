package com.CNTTK18.user_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.user_service.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {}
