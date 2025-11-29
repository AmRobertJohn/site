<?php
// api/shop_request.php
// Handles "Request to purchase" from the Shop drawer

require_once __DIR__ . '/../admin/includes/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = get_db();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Database connection error.'
    ]);
    exit;
}

// --- Read JSON body or fallback to POST ---
$raw    = file_get_contents('php://input');
$data   = json_decode($raw, true);
$isJson = json_last_error() === JSON_ERROR_NONE && is_array($data);

if (!$isJson) {
    $data = $_POST;
}

// Helpers to read fields exactly like shop.js sends them
$read = function (string $key, array $data): string {
    return isset($data[$key]) ? trim((string)$data[$key]) : '';
};

$name    = $read('name', $data);
$email   = $read('email', $data);
$phone   = $read('phone', $data);
$company = $read('company', $data);
$notes   = $read('notes', $data);

// Optional extra fields if you later add them to the form
$country          = $read('country', $data);
$contact_method   = $read('contact_method', $data);
$delivery_location = $read('delivery_location', $data);

// Cart items come as an array of objects: [{id, sku, title, ...}]
$itemsRaw = $data['items'] ?? [];

// --- Validate required fields ---
if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'ok'      => false,
        'message' => 'Name and a valid email are required.'
    ]);
    exit;
}

// --- Normalise items into a list of product IDs ---
$itemIds = [];

if (is_array($itemsRaw)) {
    foreach ($itemsRaw as $item) {
        if (is_array($item) && isset($item['id']) && ctype_digit((string)$item['id'])) {
            $itemIds[] = (int)$item['id'];
        }
    }
}

$itemIds = array_values(array_unique($itemIds));
$itemsJson = json_encode($itemIds);

// --- Insert into leads table ---
try {
    $stmt = $db->prepare(
        'INSERT INTO leads
         (source, name, email, phone, company, country, contact_method, delivery_location, message, items_json, status)
         VALUES
         (\'shop\', ?, ?, ?, ?, ?, ?, ?, ?, ?, \'new\')'
    );

    $stmt->execute([
        $name,
        $email,
        $phone !== '' ? $phone : null,
        $company !== '' ? $company : null,
        $country !== '' ? $country : null,
        $contact_method !== '' ? $contact_method : null,
        $delivery_location !== '' ? $delivery_location : null,
        $notes !== '' ? $notes : null,
        $itemsJson,
    ]);

    $requestId = (int)$db->lastInsertId();
} catch (Throwable $e) {
    http_response_code(500);
    error_log('shop_request insert error: ' . $e->getMessage());
    echo json_encode([
        'ok'      => false,
        'message' => 'Could not save your request at this time.'
    ]);
    exit;
}

// --- Email notifications ---

// 1) Support email
$supportEmail   = 'support@ad-ug.com';
$supportSubject = 'New Shop Quote Request #' . $requestId;

$lines = [
    "You have a new shop quote request on AD Broadcast website.",
    "",
    "Name: $name",
    "Email: $email",
    "Phone: $phone",
    "Company: $company",
    "Country: $country",
    "Preferred contact: $contact_method",
    "Delivery location: $delivery_location",
    "",
    "Notes:",
    $notes !== '' ? $notes : '(none)',
    "",
    "Requested product IDs: " . (empty($itemIds) ? '(none captured)' : implode(', ', $itemIds)),
    "",
    "View this in the admin panel (Leads -> Shop Requests).",
];

@mail(
    $supportEmail,
    $supportSubject,
    implode("\r\n", $lines),
    "From: no-reply@ad-ug.com\r\n"
);

// 2) Client confirmation email (banking text is placeholder)
$clientSubject = 'We received your request #' . $requestId . ' - AD Broadcast';
$clientLines = [
    "Dear $name,",
    "",
    "Thank you for your request to purchase from AD Broadcast & I.T Solutions.",
    "We have received your list of items and will prepare a formal quotation.",
    "",
    "Once you confirm the quotation, you will be able to pay via our shared banking / mobile money details.",
    "",
    "If you need urgent assistance, you can reply directly to this email.",
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

// --- Final response for JS ---
echo json_encode([
    'ok'      => true,
    'message' => 'Request sent successfully.'
]);
