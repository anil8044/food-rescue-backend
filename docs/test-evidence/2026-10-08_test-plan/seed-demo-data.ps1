param(
    [string]$BaseUrl = "http://localhost:8080/api"
)

$ErrorActionPreference = "Stop"

function Post-Json {
    param(
        [string]$Uri,
        [hashtable]$Body
    )
    return Invoke-RestMethod -Method Post -Uri $Uri -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 5)
}

function Put-Json {
    param(
        [string]$Uri,
        [hashtable]$Body
    )
    return Invoke-RestMethod -Method Put -Uri $Uri -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 5)
}

Write-Host "Seeding Food Rescue demo data..." -ForegroundColor Cyan
Write-Host "API: $BaseUrl"

# Fixed credentials are intentional for local H2 demo/test data.
$adminBody = @{
    fullName         = "Demo Admin"
    email            = "admin.demo@foodrescue.test"
    password         = "DemoPass123!"
    role             = "ADMIN"
    organisationName = "South Australian Food Rescue Network"
    phoneNumber      = "08 7000 0001"
    address          = "Adelaide SA"
}

$donorBody = @{
    fullName         = "Demo Donor"
    email            = "donor.demo@foodrescue.test"
    password         = "DemoPass123!"
    role             = "DONOR"
    organisationName = "Demo Bakery"
    phoneNumber      = "08 7000 0002"
    address          = "123 Market St, Adelaide SA"
}

$recipientBody = @{
    fullName         = "Demo Recipient"
    email            = "recipient.demo@foodrescue.test"
    password         = "DemoPass123!"
    role             = "RECIPIENT_ORG"
    organisationName = "Demo Community Kitchen"
    phoneNumber      = "08 7000 0003"
    address          = "45 Community Rd, Adelaide SA"
}

try {
    $admin = Post-Json "$BaseUrl/users" $adminBody
    Write-Host "Created admin: id=$($admin.id) email=$($admin.email)" -ForegroundColor Green

    $donor = Post-Json "$BaseUrl/users" $donorBody
    Write-Host "Created donor: id=$($donor.id) email=$($donor.email)" -ForegroundColor Green

    $recipient = Post-Json "$BaseUrl/users" $recipientBody
    Write-Host "Created recipient: id=$($recipient.id) status=$($recipient.verificationStatus)" -ForegroundColor Green

    $approveBody = @{
        fullName           = $recipientBody.fullName
        organisationName   = $recipientBody.organisationName
        phoneNumber        = $recipientBody.phoneNumber
        address            = $recipientBody.address
        verificationStatus = "APPROVED"
    }

    $approvedRecipient = Put-Json "$BaseUrl/users/$($recipient.id)" $approveBody
    Write-Host "Approved recipient: id=$($approvedRecipient.id) status=$($approvedRecipient.verificationStatus)" -ForegroundColor Green

    $expiry = (Get-Date).ToUniversalTime().AddDays(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $deadline = (Get-Date).ToUniversalTime().AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")

    $donationBody = @{
        title              = "Demo Fresh Bread"
        description        = "Seeded donation for frontend and QA testing"
        category           = "BAKERY"
        quantity           = 5
        quantityUnit       = "kg"
        dietaryInfo        = "Contains gluten"
        storageInfo        = "Store at room temperature"
        expiryDateTime     = $expiry
        collectionDeadline = $deadline
        pickupAddress      = "123 Market St, Adelaide SA"
    }

    $donation = Post-Json "$BaseUrl/donations?donorId=$($donor.id)" $donationBody
    Write-Host "Created donation: id=$($donation.id) status=$($donation.status)" -ForegroundColor Green

    Write-Host ""
    Write-Host "Seed completed successfully." -ForegroundColor Cyan
    Write-Host "ADMIN     : $($admin.email) / DemoPass123!"
    Write-Host "DONOR     : $($donor.email) / DemoPass123!"
    Write-Host "RECIPIENT : $($recipient.email) / DemoPass123! (APPROVED)"
    Write-Host "DONATION  : id=$($donation.id)"
}
catch {
    Write-Host ""
    Write-Host "Seed failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Check that:"
    Write-Host "  1) the Spring Boot backend is running on http://localhost:8080"
    Write-Host "  2) the API contract still matches API_DOCUMENTATION.md"
    Write-Host "  3) the H2 database was restarted if fixed demo emails already exist"
    exit 1
}
