<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    protected $signature   = "db:backup";
    protected $description = "Create a compressed MySQL database backup and clean up old ones";

    public function handle(): int
    {
        $db       = config("database.connections.mysql.database");
        $user     = config("database.connections.mysql.username");
        $password = config("database.connections.mysql.password");
        $host     = config("database.connections.mysql.host");
        $port     = config("database.connections.mysql.port", 3306);

        $timestamp  = now()->format("Y-m-d_H-i-s");
        $filename   = "backup_{$db}_{$timestamp}.sql.gz";
        $backupPath = storage_path("backups/{$filename}");

        if (!is_dir(storage_path("backups"))) {
            mkdir(storage_path("backups"), 0755, true);
        }

        $passwordFlag = $password ? "-p" . escapeshellarg($password) : "";
        $command = "mysqldump -h {$host} -P {$port} -u " . escapeshellarg($user) . " {$passwordFlag} " . escapeshellarg($db) . " | gzip > " . escapeshellarg($backupPath);

        $this->info("Starting backup of database {$db}...");
        exec($command, $output, $exitCode);

        if ($exitCode !== 0 || !file_exists($backupPath)) {
            $this->error("Backup FAILED. Exit code: {$exitCode}");
            \Illuminate\Support\Facades\Log::error("Database backup failed", ["database" => $db, "exit_code" => $exitCode]);
            return self::FAILURE;
        }

        $sizeMb = round(filesize($backupPath) / 1024 / 1024, 2);
        $this->info("Backup created: {$filename} ({$sizeMb} MB)");
        \Illuminate\Support\Facades\Log::info("Database backup successful", ["file" => $filename, "size_mb" => $sizeMb]);

        $this->cleanOldBackups();
        return self::SUCCESS;
    }

    private function cleanOldBackups(): void
    {
        $backupDir  = storage_path("backups");
        $cutoffTime = now()->subDays(7)->timestamp;
        $deleted    = 0;

        foreach (glob($backupDir . "/backup_*.sql.gz") as $file) {
            if (filemtime($file) < $cutoffTime) {
                unlink($file);
                $deleted++;
            }
        }

        if ($deleted > 0) {
            $this->info("Cleaned up {$deleted} old backup(s) older than 7 days.");
        }
    }
}
