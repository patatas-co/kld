<?php
// Session bootstrap and helper utilities for authentication state.

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'cookie_lifetime' => 0,
        'cookie_httponly' => true,
        'use_strict_mode' => true,
    ]);
}

function isAuthenticated(): bool
{
    return isset($_SESSION['user_id']);
}

function getAuthenticatedUser(): ?array
{
    if (!isAuthenticated()) {
        return null;
    }

    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? null,
        'email' => $_SESSION['email'] ?? null,
    ];
}

function requireAuthentication(): void
{
    if (!isAuthenticated()) {
        header('Location: user-login.html');
        exit;
    }
}
