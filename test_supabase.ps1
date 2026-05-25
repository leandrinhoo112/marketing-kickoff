$url = "https://szscamhegxbywbulptyg.supabase.co/rest/v1/kickoffs?select=*"
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M"
}
Write-Output "--- TESTANDO SELECT ---"
try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Output "SELECT SUCCESS!"
    Write-Output "Linhas encontradas: $($response.Count)"
} catch {
    Write-Output "SELECT FAILED!"
    Write-Output $_.Exception.Message
    Write-Output $_.ErrorDetails.Message
}

Write-Output ""
Write-Output "--- TESTANDO INSERT ---"
$insertUrl = "https://szscamhegxbywbulptyg.supabase.co/rest/v1/kickoffs"
$headersInsert = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6c2NhbWhlZ3hieXdidWxwdHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTMzNTYsImV4cCI6MjA5NDIyOTM1Nn0.zDwmCpC3rV_NFQxflD469fDIWrH81_c-rcrLPun7w6M"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}
$body = @{
    username = "TESTE_SISTEMA|#ff0000"
    yesterday_tasks = "Teste do sistema"
    today_tasks = "Teste do sistema"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $insertUrl -Headers $headersInsert -Method Post -Body $body
    Write-Output "INSERT SUCCESS!"
} catch {
    Write-Output "INSERT FAILED!"
    Write-Output $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Output $_.ErrorDetails.Message
    }
}
