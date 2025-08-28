$json = Get-Content "assets/data/matchups.json" -Raw | ConvertFrom-Json
$updated = $false

# Iterate champions
foreach ($prop in $json.matchups.PSObject.Properties) {
  $champ = $prop.Name
  $tips = @()
  if ($json.matchups.$champ.tips) {
    $tips = [System.Collections.Generic.List[string]]::new()
    $json.matchups.$champ.tips | ForEach-Object { [void]$tips.Add([string]$_) }
  } else {
    continue
  }

  $i = 0
  while ($i -lt $tips.Count) {
    $t = $tips[$i]
    if ($t -match '^(?i)Important Mechanics:') {
      # Ensure Advantage: exists before
      if ($i -eq 0 -or ($tips[$i-1] -notmatch '^(?i)Advantage:')) {
        $tips.Insert($i, 'Advantage:')
        $updated = $true
        $i++ # skip over the inserted Advantage:
      }
      # Ensure General Macro: exists after
      $nextIndex = $i + 1
      if ($nextIndex -ge $tips.Count -or ($tips[$nextIndex] -notmatch '^(?i)General Macro:')) {
        $tips.Insert($nextIndex, 'General Macro:')
        $updated = $true
        # no need to move index here
      }
    }
    $i++
  }

  $json.matchups.$champ.tips = $tips
}

if ($updated) {
  $json | ConvertTo-Json -Depth 100 | Set-Content "assets/data/matchups.json" -Encoding UTF8
  Write-Output "Updated=true"
} else {
  Write-Output "Updated=false"
}
