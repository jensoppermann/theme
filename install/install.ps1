<#

.EXAMPLE
.\install.ps1 'Release'
.\install.ps1 'Debug'
.\install.ps1

#>

#Requires -Version 7.0

Param
(
	[Parameter(Mandatory=$false, HelpMessage='BuildConfiguration (Release or Debug)', Position=1)]
	[string]$buildConfigurationParam
)

$ErrorActionPreference = "Stop"

Write-Host ''
Write-Host "Begin install.ps1"
$startTimeTotal = Get-Date

Write-Host ''
Write-Host "Parameter BuildConfiguration: '$buildConfigurationParam'"

$nodeName = 'dotnet-nodejs'
$nodeVersion = '20.11.1'
$nodePath = "$env:userprofile\.dotnet\tools\.store\$nodeName\$nodeVersion\$nodeName\$nodeVersion\content\nodejs"

Write-Host ''
Write-Host 'Ermittle globale dotnet-tool-Installation von dotnet-nodejs...'
$dotnetToolList = (dotnet tool list -g $nodeName)
#Write-Host $dotnetToolList #Debug
if ($dotnetToolList -like "*$nodeName*")
{
    Write-Host 'dotnet-nodejs ist bereits installiert'
}
else
{
	Write-Host 'dotnet-nodejs ist noch nicht installiert'
	Write-Host 'Installiere dotnet-nodejs als globales dotnet-tool...'
	dotnet tool install -g $nodeName --version $nodeVersion
	if ($LASTEXITCODE -eq 0)
	{
		Write-Host "dotnet-nodejs ist nun erfolgreich installiert"
	}
	else
	{
		Write-Host "dotnet-nodejs wurde nicht erfolgreich installiert"
		Write-Host "ExitCode: '$LASTEXITCODE'"
		Write-Host "install.ps1 wird beendet..."
		exit 1
	}
}

Write-Host ''
Write-Host 'Ermittle dotnet-nodejs-Pfad in der path-Variable vom User...'
$pathUserVar = [Environment]::GetEnvironmentVariable('path', 'User')
#Write-Host $pathUserVar #Debug
if ($pathUserVar -like '*dotnet-nodejs*')
{
	Write-Host 'dotnet-nodejs-Pfad ist bereits in der path-Variable vorhanden'
}
else
{
	Write-Host 'dotnet-nodejs-Pfad ist noch nicht in der path-Variable vom User vorhanden'
	Write-Host 'Initialisiere dotnet-nodejs... (System.IO.IOException wird erwartet)'
	dotnet nodejs init # nodejs init wirft möglischerweise eine Exception beim Entpacken
	# diese Exception kriegen wir hier nicht mit Try&Catch oder $LASTEXITCODE gefangen
	if (Test-Path "$nodePath\win-x64")
	{
		Write-Host "dotnet-nodejs ist nun erfolgreich initialisiert"
	}
	else
	{
		Write-Host "dotnet-nodejs wurde nicht erfolgreich initialisiert"
		Write-Host "es wurde nicht korrekt entpackt, aber das korrigieren wir jetzt mal..."
		if (Test-Path "$nodePath\tmp")
		{
			if (Test-Path "$nodePath\tmp\node-v$nodeVersion-win-x64")
			{
				Move-Item -Path "$nodePath\tmp\node-v$nodeVersion-win-x64" -Destination "$nodePath\win-x64" -Force
			}
			Remove-Item -Path "$nodePath\tmp" -Force
		}
		if (!(Test-Path "$nodePath\win-x64"))
		{
			if (Test-Path "$nodePath\win-x64.zip")
			{
				Expand-Archive -Path "$nodePath\win-x64.zip" -DestinationPath $nodePath -Force
				if (Test-Path "$nodePath\node-v$nodeVersion-win-x64")
				{
					Move-Item -Path "$nodePath\node-v$nodeVersion-win-x64" -Destination "$nodePath\win-x64" -Force
				}
			}
		}
		Write-Host 'Initialisiere dotnet-nodejs... (zweiter Versuch für path-Variable)'
		dotnet nodejs init
	}
	
	if ($LASTEXITCODE -eq 0)
	{
		$nodejsPath = (dotnet nodejs get-location)
		#Write-Host $nodejsPath #Debug
		$env:PATH += ";$nodejsPath"
	}
	else
	{
		Write-Host "dotnet-nodejs wurde nicht erfolgreich initialisiert"
		Write-Host "ExitCode: '$LASTEXITCODE'"
		Write-Host "install.ps1 wird beendet..."
		exit 1
	}
}

Write-Host ''
Write-Host 'Ermittle dotnet-nodejs-Pfad in der path-Variable...'
$pathVariable = $env:PATH
#Write-Host $pathVariable #Debug
if ($pathVariable.Contains('dotnet-nodejs'))
{
	Write-Host 'dotnet-nodejs-Pfad ist bereits in der path-Variable vorhanden'
}
else
{
	Write-Host 'dotnet-nodejs-Pfad ist noch nicht in der path-Variable vorhanden'
	Write-Host 'dotnet-nodejs-Pfad wird nun in die path-Variable integriert...'
	$nodejsPath = (dotnet nodejs get-location)
	if ($pathVariable.EndsWith(';'))
	{
		$env:PATH += "$nodejsPath"
	}
	else
	{
		$env:PATH += ";$nodejsPath"
	}
	Write-Host 'dotnet-nodejs-Pfad ist nun in der path-Variable integriert'
}

Write-Host ''
Write-Host 'Ermittle node_modules-Ordner im Theme-Ordner...'
if (Test-Path '../node_modules')
{
    Write-Host 'node_modules-Ordner ist bereits im Theme-Ordner vorhanden'
}
else
{
    Write-Host 'node_modules-Ordner ist noch nicht im Theme-Ordner vorhanden'
	Write-Host 'Entpacke node_modules-Ordner...'
    #Direkter ZIP-Aufruf von System.IO.Compression.FileSystem
    $zipPath = Join-Path $PSScriptRoot "node_module_src.zip"
    $destinationPath = Join-Path $PSScriptRoot ".."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $destinationPath, $true)
	if ($LASTEXITCODE -eq 0)
	{
		Write-Host "Entpacken erfolgreich abgeschlossen"
	}
	else
	{
		Write-Host "Entpacken wurde nicht erfolgreich abgeschlossen"
		Write-Host "ExitCode: '$LASTEXITCODE'"
		Write-Host "install.ps1 wird beendet..."
		exit 1
	}
}

Write-Host ''
Write-Host "Starte 'npm install'..."
npm install --no-fund
if ($LASTEXITCODE -eq 0)
{
	Write-Host "'npm install' erfolgreich abgeschlossen"
}
else
{
	Write-Host "'npm install' nicht erfolgreich abgeschlossen"
	Write-Host "ExitCode: '$LASTEXITCODE'"
	Write-Host "install.ps1 wird beendet..."
	exit 1
}

Write-Host ''
Write-Host "Starte 'npm run'..."
if ($buildConfigurationParam -eq 'Release')
{
	Write-Host 'Modus: Release / prod'
	npm run build:prod
}
else
{
	Write-Host 'Modus: Debug / dev'
	npm run build:dev
}
if ($LASTEXITCODE -eq 0)
{
	Write-Host "'npm run' erfolgreich abgeschlossen"
}
else
{
	Write-Host "'npm run' nicht erfolgreich abgeschlossen"
	Write-Host "ExitCode: '$LASTEXITCODE'"
	Write-Host "install.ps1 wird beendet..."
	exit 1
}

Write-Host ''
$endTimeTotal = Get-Date
$durationTotal = [math]::Round((($endTimeTotal - $startTimeTotal).TotalSeconds), 2)
Write-Host "Dauer install.ps1: $durationTotal Sekunden"
Write-Host "End install.ps1"
Write-Host ''
exit 0