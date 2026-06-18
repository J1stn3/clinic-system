using System.Text.RegularExpressions;
using Npgsql;

namespace clinic_management_api.Data;

public static class DatabaseBootstrap
{
    public static string ResolveConnectionString(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        var password = configuration["Database:Password"]
            ?? Environment.GetEnvironmentVariable("ICMS_DB_PASSWORD");

        if (!string.IsNullOrWhiteSpace(password))
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString) { Password = password };
            connectionString = builder.ConnectionString;
        }

        return connectionString;
    }

    public static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var databaseName = builder.Database
            ?? throw new InvalidOperationException("Database name is missing from the connection string.");

        if (!Regex.IsMatch(databaseName, @"^[a-zA-Z_][a-zA-Z0-9_]*$"))
            throw new InvalidOperationException($"Invalid database name: {databaseName}");

        builder.Database = "postgres";
        await using var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync();

        await using var check = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @name", connection);
        check.Parameters.AddWithValue("name", databaseName);
        var exists = await check.ExecuteScalarAsync() is not null;
        if (exists)
            return;

        await using var create = new NpgsqlCommand($"""CREATE DATABASE "{databaseName}" """, connection);
        await create.ExecuteNonQueryAsync();
    }
}
