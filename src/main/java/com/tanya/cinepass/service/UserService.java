package com.tanya.cinepass.service;

import lombok.RequiredArgsConstructor;

import com.tanya.cinepass.dto.UserDto;
import com.tanya.cinepass.dto.UserRegistrationDto;
import com.tanya.cinepass.Exception.ResourceNotFoundException;
import com.tanya.cinepass.model.Role;
import com.tanya.cinepass.model.User;
import com.tanya.cinepass.repository.UserRepository;
import com.tanya.cinepass.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserDto createUser(UserRegistrationDto registrationDto)
    {
        User user=new User();
        user.setName(registrationDto.getName());
        user.setEmail(registrationDto.getEmail());
        user.setPhoneNumber(registrationDto.getPhoneNumber());

        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));

        user.setRole(Role.USER);
        User savedUser=userRepository.save(user);
        return mapToDto(savedUser);
    }

    public UserDto getUserById(Long id)
    {
        SecurityUtils.verifyOwnerOrAdmin(id);
        User user=userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Use not found with id: "+id));
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers()
    {
        List<User> users=userRepository.findAll();
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto updateUser(Long id, UserDto userDto)
    {
        SecurityUtils.verifyOwnerOrAdmin(id);
        User user=userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+id));
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setPhoneNumber(userDto.getPhoneNumber());
        User updatedUser=userRepository.save(user);
        return mapToDto(updatedUser);
    }

    public void deleteUser(Long id)
    {
        User user=userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+id));
        userRepository.delete(user);
    }

    private UserDto mapToDto(User user)
    {
        UserDto userDto=new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setRole(user.getRole().name());
        return userDto;

    }
}
