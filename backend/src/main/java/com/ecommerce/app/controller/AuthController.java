// package com.ecommerce.app.controller;

// import com.ecommerce.app.entity.User;
// //import com.ecommerce.app.security.JwtUtil;
// import com.ecommerce.app.service.UserService;
// import jakarta.validation.Valid;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.Optional;

// @RestController
// @RequestMapping("/auth")
// @CrossOrigin(origins = "*")
// public class AuthController {
    
//     @Autowired
//     private UserService userService;
    
//     // @Autowired
//     // private JwtUtil jwtUtil;
    
//     @PostMapping("/register")
//     public ResponseEntity<?> register(@Valid @RequestBody User user) {
//         try {
//             User registeredUser = userService.registerUser(user);
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", true);
//             response.put("message", "User registered successfully");
//             response.put("user", registeredUser);
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
//         String username = loginData.get("username");
//         String password = loginData.get("password");
        
//         Optional<User> user = userService.loginUser(username, password);
//         Map<String, Object> response = new HashMap<>();
        
//         if (user.isPresent()) {
//             String token = jwtUtil.generateToken(user.get().getUsername(), user.get().getRole().toString());
//             response.put("success", true);
//             response.put("message", "Login successful");
//             response.put("token", token);
//             response.put("user", user.get());
//             return ResponseEntity.ok(response);
//         } else {
//             response.put("success", false);
//             response.put("message", "Invalid username or password");
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @GetMapping("/user/{id}")
//     public ResponseEntity<?> getUserById(@PathVariable Long id) {
//         Optional<User> user = userService.findById(id);
//         if (user.isPresent()) {
//             return ResponseEntity.ok(user.get());
//         }
//         return ResponseEntity.notFound().build();
//     }
    
//     @PutMapping("/user/{id}")
//     public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userUpdate) {
//         Optional<User> existingUser = userService.findById(id);
//         if (existingUser.isPresent()) {
//             User user = existingUser.get();
//             user.setFirstName(userUpdate.getFirstName());
//             user.setLastName(userUpdate.getLastName());
//             user.setPhone(userUpdate.getPhone());
//             user.setAddress(userUpdate.getAddress());
//             user.setZipcode(userUpdate.getZipcode());
//             if (userUpdate.getProfilePicture() != null) {
//                 user.setProfilePicture(userUpdate.getProfilePicture());
//             }
//             User updatedUser = userService.updateUser(user);
//             return ResponseEntity.ok(updatedUser);
//         }
//         return ResponseEntity.notFound().build();
//     }
    
//     @PutMapping("/user/{id}/profile-picture")
//     public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, String> data) {
//         try {
//             Optional<User> existingUser = userService.findById(id);
//             if (existingUser.isPresent()) {
//                 User user = existingUser.get();
//                 user.setProfilePicture(data.get("profilePicture"));
//                 User updatedUser = userService.updateUser(user);
                
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", true);
//                 response.put("message", "Profile picture updated successfully");
//                 response.put("user", updatedUser);
//                 return ResponseEntity.ok(response);
//             }
            
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", "User not found");
//             return ResponseEntity.status(404).body(response);
            
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @GetMapping("/users")
//     public ResponseEntity<?> getAllUsers() {
//         try {
//             return ResponseEntity.ok(userService.getAllUsers());
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @PostMapping("/forgot-password")
//     public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
//         try {
//             String email = request.get("email");
//             if (email == null || email.trim().isEmpty()) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Email is required");
//                 return ResponseEntity.badRequest().body(response);
//             }
            
//             String resetToken = userService.initiatePasswordReset(email);
//             Map<String, Object> response = new HashMap<>();
            
//             if (resetToken != null) {
//                 response.put("success", true);
//                 response.put("message", "Password reset instructions sent to your email");
//                 response.put("resetToken", resetToken); // For demo purposes
//             } else {
//                 response.put("success", false);
//                 response.put("message", "Email not found");
//             }
            
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @GetMapping("/check-email/{email}")
//     public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
//         try {
//             boolean exists = userService.emailExists(email);
//             Map<String, Object> response = new HashMap<>();
//             response.put("exists", exists);
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
    
//     @PostMapping("/reset-password")
//     public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
//         try {
//             String token = request.get("token");
//             String newPassword = request.get("password");
            
//             if (token == null || newPassword == null || token.trim().isEmpty() || newPassword.trim().isEmpty()) {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("success", false);
//                 response.put("message", "Token and password are required");
//                 return ResponseEntity.badRequest().body(response);
//             }
            
//             boolean result = userService.resetPassword(token, newPassword);
//             Map<String, Object> response = new HashMap<>();
            
//             if (result) {
//                 response.put("success", true);
//                 response.put("message", "Password reset successfully");
//             } else {
//                 response.put("success", false);
//                 response.put("message", "Invalid or expired reset token");
//             }
            
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             Map<String, Object> response = new HashMap<>();
//             response.put("success", false);
//             response.put("message", e.getMessage());
//             return ResponseEntity.badRequest().body(response);
//         }
//     }
// }







package com.ecommerce.app.controller;

import com.ecommerce.app.entity.User;
import com.ecommerce.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", registeredUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        Optional<User> user = userService.loginUser(username, password);
        Map<String, Object> response = new HashMap<>();
        if (user.isPresent()) {
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", user.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userUpdate) {
        Optional<User> existingUser = userService.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFirstName(userUpdate.getFirstName());
            user.setLastName(userUpdate.getLastName());
            user.setPhone(userUpdate.getPhone());
            user.setAddress(userUpdate.getAddress());
            user.setZipcode(userUpdate.getZipcode());
            if (userUpdate.getProfilePicture() != null) {
                user.setProfilePicture(userUpdate.getProfilePicture());
            }
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            Optional<User> existingUser = userService.findById(id);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                user.setProfilePicture(data.get("profilePicture"));
                User updatedUser = userService.updateUser(user);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Profile picture updated successfully");
                response.put("user", updatedUser);
                return ResponseEntity.ok(response);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            String resetToken = userService.initiatePasswordReset(email);
            Map<String, Object> response = new HashMap<>();
            if (resetToken != null) {
                response.put("success", true);
                response.put("message", "Password reset instructions sent to your email");
                response.put("resetToken", resetToken); // For demo purposes
            } else {
                response.put("success", false);
                response.put("message", "Email not found");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userService.emailExists(email);
            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("password");
            if (token == null || newPassword == null || token.trim().isEmpty() || newPassword.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Token and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            boolean result = userService.resetPassword(token, newPassword);
            Map<String, Object> response = new HashMap<>();
            if (result) {
                response.put("success", true);
                response.put("message", "Password reset successfully");
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired reset token");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
