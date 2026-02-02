package com.CNTTK18.auth_service.service;

import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.CNTTK18.auth_service.model.UserPrinciple;
import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = userRepository
                .findByUsername(username).orElseGet(() -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username)));

        return new UserPrinciple(user);
    }

    public UserPrinciple loadUserByUserId(UUID id) throws UsernameNotFoundException {
        Users user = userRepository
                .findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return new UserPrinciple(user);
    }
}
