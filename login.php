<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$email = strtolower(trim($_POST['email'] ?? ''));
$password = $_POST['password'] ?? '';
$remember = filter_var($_POST['remember'] ?? false, FILTER_VALIDATE_BOOLEAN);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

if (!str_ends_with($email, '@kld.edu.ph')) {
    echo json_encode(['status' => 'error', 'message' => 'Only school email addresses (@kld.edu.ph) are allowed.']);
    exit;
}

if ($password === '') {
    echo json_encode(['status' => 'error', 'message' => 'Please enter your password.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode(['status' => 'error', 'message' => 'Incorrect email or password.']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];

    if ($remember) {
        $lifetime = 60 * 60 * 24 * 7; // 7 days
        setcookie(session_name(), session_id(), [
            'expires' => time() + $lifetime,
            'path' => '/',
            'httponly' => true,
            'secure' => isset($_SERVER['HTTPS']),
            'samesite' => 'Lax',
        ]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Login successful. Redirecting...']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred. Please try again later.']);
}
