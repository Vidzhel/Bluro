Write-Host $PSScriptRoot
Set-Location $PSScriptRoot

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
Invoke-Expression "& docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up"

