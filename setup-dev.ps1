# ============================================================
#  Lyra Music — Script de setup developpement Windows
#  Execute ce script APRES avoir installe Node.js
#  Usage: clic droit sur ce fichier -> "Executer avec PowerShell"
# ============================================================

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectRoot "backend"
$MobilePath  = Join-Path $ProjectRoot "mobile"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   LYRA MUSIC - Setup Developpement" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Verif Node.js ---
Write-Host "[1/5] Verification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "     Node.js installe : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "     ERREUR : Node.js n'est pas installe !" -ForegroundColor Red
    Write-Host "     Va sur https://nodejs.org et installe la version LTS." -ForegroundColor Red
    Write-Host "     Puis redemarre ton PC et relance ce script." -ForegroundColor Red
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

# --- Fichier .env ---
Write-Host ""
Write-Host "[2/5] Configuration du fichier .env..." -ForegroundColor Yellow
$EnvFile    = Join-Path $BackendPath ".env"
$EnvExample = Join-Path $BackendPath ".env.example"

if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "     Fichier .env cree depuis .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "     IMPORTANT : Ouvre le fichier suivant et remplis DATABASE_URL :" -ForegroundColor Magenta
    Write-Host "     $EnvFile" -ForegroundColor White
    Write-Host ""
    $answer = Read-Host "     As-tu deja configure ton DATABASE_URL ? (o/n)"
    if ($answer -ne "o") {
        Write-Host ""
        Write-Host "     Suis ces etapes :" -ForegroundColor Yellow
        Write-Host "     1. Va sur https://supabase.com et cree un compte gratuit"
        Write-Host "     2. Cree un projet nomme 'lyra-music'"
        Write-Host "     3. Settings -> Database -> Connection string -> URI"
        Write-Host "     4. Copie l'URL et colle-la dans .env a la ligne DATABASE_URL"
        Write-Host "     5. Relance ce script"
        Write-Host ""
        notepad $EnvFile
        Read-Host "Appuie sur Entree pour fermer"
        exit 0
    }
} else {
    Write-Host "     Fichier .env existe deja" -ForegroundColor Green
}

# --- Backend : npm install ---
Write-Host ""
Write-Host "[3/5] Installation des dependances backend..." -ForegroundColor Yellow
Set-Location $BackendPath
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "     Dependances backend installees" -ForegroundColor Green
} else {
    Write-Host "     ERREUR lors de npm install backend" -ForegroundColor Red
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

# --- Prisma generate + migrate ---
Write-Host ""
Write-Host "[4/5] Configuration de la base de donnees..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "     Client Prisma genere" -ForegroundColor Green
} else {
    Write-Host "     ERREUR lors de prisma generate" -ForegroundColor Red
}

npx prisma migrate dev --name init 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "     Tables creees dans la base de donnees" -ForegroundColor Green
} else {
    Write-Host "     ATTENTION : migration echouee - verifie DATABASE_URL dans .env" -ForegroundColor Magenta
}

# --- Mobile : npm install ---
Write-Host ""
Write-Host "[5/5] Installation des dependances mobile..." -ForegroundColor Yellow
Set-Location $MobilePath
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "     Dependances mobile installees" -ForegroundColor Green
} else {
    Write-Host "     ERREUR lors de npm install mobile" -ForegroundColor Red
}

# --- Fin ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   SETUP TERMINE !" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour lancer le projet, ouvre 2 fenetres PowerShell :" -ForegroundColor White
Write-Host ""
Write-Host "  Fenetre 1 - Backend :" -ForegroundColor Yellow
Write-Host "    cd '$BackendPath'" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Fenetre 2 - Mobile :" -ForegroundColor Yellow
Write-Host "    cd '$MobilePath'" -ForegroundColor Gray
Write-Host "    npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  Puis scanne le QR code avec l'app Expo Go sur ton telephone" -ForegroundColor White
Write-Host ""
Write-Host "  Consulte GUIDE_DEV_WINDOWS.md pour plus de details." -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
