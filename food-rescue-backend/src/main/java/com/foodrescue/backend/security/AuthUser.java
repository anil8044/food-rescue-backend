package com.foodrescue.backend.security;

import com.foodrescue.backend.model.Role;

/**
 * The signed-in user as seen by the security layer (taken from the database
 * on every request, so role or suspension changes apply immediately).
 */
public record AuthUser(Long id, String email, Role role) {
}
