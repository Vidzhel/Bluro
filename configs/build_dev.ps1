Write-Host $PSScriptRoot
Set-Location $PSScriptRoot
$envFile = "./.env"

# Setting up Environment
Set-Location ../bluro_cms
Write-Host Installing bluro_cms dependencies
npm install

Set-Location ../tech_overload_blog
Write-Host Installing tech_overload_blog dependencies
npm install

Set-Location ../admin_panel
Write-Host Installing admin_panel dependencies
npm install

Set-Location ../configs

# Creating .env file with db image for windows
$envFileExists = Test-Path $envFile -PathType Leaf
if (-Not $envFileExists) {
    New-Item -Name $envFile 
    Set-Content -Path $envFile -Value "DB_IMAGE=mysql:5.7.30" -Encoding  UTF8
}

Invoke-Expression "& docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up"

