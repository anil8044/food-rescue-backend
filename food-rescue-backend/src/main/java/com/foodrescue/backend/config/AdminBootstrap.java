package com.foodrescue.backend.config;

import com.foodrescue.backend.model.Role;
import com.foodrescue.backend.model.User;
import com.foodrescue.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * An ADMIN cannot register through the public API, so the first administrator is
 * created at start-up from configuration (only when no administrator exists yet).
 */
@Configuration
public class AdminBootstrap {

    @Bean
    CommandLineRunner createFirstAdmin(UserRepository users,
                                       PasswordEncoder encoder,
                                       @Value("${app.bootstrap-admin.email:}") String email,
                                       @Value("${app.bootstrap-admin.password:}") String password) {
        return args -> {
            if (email.isBlank() || password.isBlank()) {
                return;
            }
            if (users.findAll().stream().anyMatch(u -> u.getRole() == Role.ADMIN)) {
                return;
            }
            User admin = new User();
            admin.setFullName("Network Administrator");
            admin.setEmail(email.trim());
            admin.setPasswordHash(encoder.encode(password));
            admin.setRole(Role.ADMIN);
            users.save(admin);
        };
    }
}
