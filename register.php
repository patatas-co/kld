<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

if ($username === '' || strlen($username) < 3) {
    echo json_encode(['status' => 'error', 'message' => 'Username must be at least 3 characters long.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters long.']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
    $stmt->execute(['username' => $username, 'email' => $email]);

    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Username or email is already registered.']);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insert = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
    $insert->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => $passwordHash,
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Account created successfully. You can now sign in.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred. Please try again later.']);
}
