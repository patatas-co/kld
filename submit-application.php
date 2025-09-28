<?php
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed.',
    ]);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$contribution = trim($_POST['contribution'] ?? '');
$org = trim($_POST['org'] ?? '');

if ($name === '' || $email === '' || $message === '' || $contribution === '') {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Please complete all required fields before submitting.',
    ]);
    exit;
}

$words = preg_split('/\s+/', $message, -1, PREG_SPLIT_NO_EMPTY);
$realWords = array_filter($words, static fn($word) => preg_match('/[a-zA-Z]{2,}/', $word));

if (count($words) < 30 || count($realWords) < 10) {
    http_response_code(422);
    echo json_encode([
        'status' => 'error',
        'message' => 'Tell us more! Please share at least 30 meaningful words about why you want to join.',
    ]);
    exit;
}

$submission = [
    'timestamp' => date('c'),
    'name' => $name,
    'email' => $email,
    'message' => $message,
    'contribution' => $contribution,
    'organization' => $org,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
];

$logDir = __DIR__ . '/storage';
if (!is_dir($logDir)) {
    mkdir($logDir, 0775, true);
}

$logFile = $logDir . '/applications.log';
file_put_contents($logFile, json_encode($submission) . PHP_EOL, FILE_APPEND | LOCK_EX);

echo json_encode([
    'status' => 'success',
    'message' => 'Thank you! Your application has been received.',
]);
