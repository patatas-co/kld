<?php
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');

echo json_encode([
    'authenticated' => isAuthenticated(),
    'user' => getAuthenticatedUser(),
]);
