package com.tanya.cinepass.config;

import com.tanya.cinepass.model.Role;
import com.tanya.cinepass.model.User;
import com.tanya.cinepass.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * CommandLineRunner's run(...) method executes exactly once, automatically, right after
 * the Spring application context finishes starting up -- this is the standard Spring Boot
 * pattern for "seed some initial data" logic.
 *
 * Why this exists: the public /api/auth/register endpoint always assigns Role.USER (see
 * UserService.createUser), by design -- otherwise anyone could register themselves as an
 * ADMIN. So we need some other way to get the first ADMIN account into the system, and
 * seeding one on startup (if none exists yet) is the simplest approach for a learning/demo
 * project. In a real production system this would instead be a one-time manual DB insert
 * or a separate internal admin-provisioning tool, not application code.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String ADMIN_EMAIL = "admin@cinepass.com";
    private static final String ADMIN_DEFAULT_PASSWORD = "Admin@123";

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            return; // already seeded on a previous run
        }

        User admin = new User();
        admin.setName("Default Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_DEFAULT_PASSWORD));
        admin.setPhoneNumber("0000000000");
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);

        System.out.println("=========================================================");
        System.out.println(" Seeded default ADMIN account:");
        System.out.println("   email:    " + ADMIN_EMAIL);
        System.out.println("   password: " + ADMIN_DEFAULT_PASSWORD);
        System.out.println(" Change this password after first login in a real deployment.");
        System.out.println("=========================================================");
    }
}

