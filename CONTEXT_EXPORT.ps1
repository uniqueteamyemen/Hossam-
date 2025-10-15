Write-Host "🦅 HOSSAM EDSS - CONTEXT EXPORT" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if memory file exists
if (Test-Path "HOSSAM_BRAIN.json") {
    # Read and display memory
    $memory = Get-Content "HOSSAM_BRAIN.json" | ConvertFrom-Json
    
    Write-Host "`n🧠 PROJECT CONTEXT:" -ForegroundColor Yellow
    Write-Host "   Project: $($memory.project)"
    Write-Host "   Commander: $($memory.commander)"
    Write-Host "   Phase: $($memory.phase)"
    Write-Host "   Last Action: $($memory.last_action)"
    
    Write-Host "`n🏗️ INFRASTRUCTURE:" -ForegroundColor Yellow
    foreach ($key in $memory.infrastructure.PSObject.Properties.Name) {
        Write-Host "   $key : $($memory.infrastructure.$key)"
    }
    
    Write-Host "`n📋 NEXT ACTIONS:" -ForegroundColor Yellow
    for ($i = 0; $i -lt [Math]::Min(3, $memory.next_actions.Length); $i++) {
        Write-Host "   $($i+1). $($memory.next_actions[$i])"
    }
    
    Write-Host "`n📋 COPY BELOW FOR NEW CHAT:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "🦅 HOSSAM EDSS CONTEXT LOAD" -ForegroundColor White
    Write-Host "Project: $($memory.project)" -ForegroundColor White
    Write-Host "Commander: $($memory.commander)" -ForegroundColor White  
    Write-Host "Phase: $($memory.phase)" -ForegroundColor White
    Write-Host "Last Action: $($memory.last_action)" -ForegroundColor White
    Write-Host "Next: $($memory.next_actions[0])" -ForegroundColor White
    Write-Host "=================================" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ HOSSAM_BRAIN.json not found!" -ForegroundColor Red
    Write-Host "Please create the memory file first." -ForegroundColor Red
}

Write-Host "`n💡 INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host "Copy the section above and paste to AI in new chat" -ForegroundColor Magenta