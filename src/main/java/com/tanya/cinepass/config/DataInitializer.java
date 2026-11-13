package com.tanya.cinepass.config;

import com.tanya.cinepass.model.Role;
import com.tanya.cinepass.model.User;
import com.tanya.cinepass.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


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
            return;
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
