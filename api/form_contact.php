<?php
require_once __DIR__ . '/../admin/includes/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = get_db();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'      => false,
        'message' => 'Database connection error.'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok'      => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

// Read JSON body, fallback to POST
$raw    = file_get_contents('php://input');
$data   = json_decode($raw, true);
$isJson = json_last_error() === JSON_ERROR_NONE && is_array($data);

if (!$isJson) {
    $data = $_POST;
}

// Helper
$read = function (string $key, array $data): string {
    return isset($data[$key]) ? trim((string)$data[$key]) : '';
};

$name    = $read('name', $data);
$email   = $read('email', $data);
$phone   = $read('phone', $data);
$company = $read('company', $data);
$subject = $read('subject', $data);
$message = $read('message', $data);

$country           = $read('country', $data);
$contact_method    = $read('contact_method', $data);
$delivery_location = $read('delivery_location', $data);

$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($message === '') {
    $errors[] = 'Message is required.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'ok'      => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// Combine subject + message for storage if subject exists
$fullMessage = $subject !== ''
    ? ('Subject: ' . $subject . "\n\n" . $message)
    : $message;

try {
    $stmt = $db->prepare(
        'INSERT INTO leads
         (source, name, email, phone, company, country, contact_method, delivery_location, message, items_json, status)
         VALUES
         (\'contact\', ?, ?, ?, ?, ?, ?, ?, ?, NULL, \'new\')'
    );

    $stmt->execute([
        $name,
        $email,
        $phone   !== '' ? $phone : null,
        $company !== '' ? $company : null,
        $country !== '' ? $country : null,
        $contact_method !== '' ? $contact_method : null,
        $delivery_location !== '' ? $delivery_location : null,
        $fullMessage,
    ]);

    $leadId = (int)$db->lastInsertId();
} catch (Throwable $e) {
    http_response_code(500);
    error_log('form_contact insert error: ' . $e->getMessage());
    echo json_encode([
        'ok'      => false,
        'message' => 'Could not send your message at this time.'
    ]);
    exit;
}

// Emails can stay here (will work on VPS once mail() is configured)

// Support email
$supportEmail   = 'support@ad-ug.com';
$supportSubject = 'New Contact Message #' . $leadId;

$supportLines = [
    "You have a new contact message from the AD Broadcast website.",
    "",
    "Name: $name",
    "Email: $email",
    "Phone: $phone",
    "Company: $company",
    "Country: $country",
    "Preferred contact: $contact_method",
    "Delivery location: $delivery_location",
    "",
    "Message:",
    $fullMessage,
];

@mail(
    $supportEmail,
    $supportSubject,
    implode("\r\n", $supportLines),
    "From: no-reply@ad-ug.com\r\n"
);

// Client confirmation
$clientSubject = 'We received your message - AD Broadcast';
$clientLines = [
    "Dear $name,",
    "",
    "Thank you for reaching out to AD Broadcast & I.T Solutions.",
    "We have received your message and will get back to you as soon as possible.",
    "",
    "Best regards,",
    "AD Broadcast & I.T Solutions",
];

@mail(
    $email,
    $clientSubject,
    implode("\r\n", $clientLines),
    "From: support@ad-ug.com\r\n"
);

echo json_encode([
    'ok'      => true,
    'message' => 'Message sent successfully.'
]);
