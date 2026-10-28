package com.foodrescue.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Login result: a signed token plus the user it belongs to.
 * The frontend sends the token in the Authorization header on later requests.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType;
    private long expiresInSeconds;
    private UserDTO user;
}
