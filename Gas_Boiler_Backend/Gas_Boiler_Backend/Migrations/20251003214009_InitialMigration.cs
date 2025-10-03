using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemParameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParameterName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Value = table.Column<double>(type: "float", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemParameters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsBlocked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GasBoilers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaxPower = table.Column<double>(type: "float", nullable: false),
                    Efficiency = table.Column<double>(type: "float", nullable: false),
                    CurrentPower = table.Column<double>(type: "float", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GasBoilers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GasBoilers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Alarms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AlarmType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GasBoilerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alarms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alarms_GasBoilers_GasBoilerId",
                        column: x => x.GasBoilerId,
                        principalTable: "GasBoilers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BuildingObjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HeatingArea = table.Column<double>(type: "float", nullable: false),
                    DesiredTemperature = table.Column<double>(type: "float", nullable: false),
                    WallUValue = table.Column<double>(type: "float", nullable: false),
                    WindowUValue = table.Column<double>(type: "float", nullable: false),
                    CeilingUValue = table.Column<double>(type: "float", nullable: false),
                    FloorUValue = table.Column<double>(type: "float", nullable: false),
                    WallArea = table.Column<double>(type: "float", nullable: false),
                    WindowArea = table.Column<double>(type: "float", nullable: false),
                    CeilingArea = table.Column<double>(type: "float", nullable: false),
                    FloorArea = table.Column<double>(type: "float", nullable: false),
                    GasBoilerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuildingObjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuildingObjects_GasBoilers_GasBoilerId",
                        column: x => x.GasBoilerId,
                        principalTable: "GasBoilers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HistoricalData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PowerOutput = table.Column<double>(type: "float", nullable: false),
                    GasConsumption = table.Column<double>(type: "float", nullable: false),
                    Cost = table.Column<double>(type: "float", nullable: false),
                    OutsideTemperature = table.Column<double>(type: "float", nullable: false),
                    InsideTemperature = table.Column<double>(type: "float", nullable: false),
                    GasBoilerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricalData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricalData_GasBoilers_GasBoilerId",
                        column: x => x.GasBoilerId,
                        principalTable: "GasBoilers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "SystemParameters",
                columns: new[] { "Id", "Description", "ParameterName", "Unit", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { 1, "Average ground temperature", "GroundTemperature", "°C", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 10.0 },
                    { 2, "Price of natural gas per kWh", "GasPricePerKWh", "RSD/kWh", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5.5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_GasBoilerId",
                table: "Alarms",
                column: "GasBoilerId");

            migrationBuilder.CreateIndex(
                name: "IX_BuildingObjects_GasBoilerId",
                table: "BuildingObjects",
                column: "GasBoilerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GasBoilers_UserId",
                table: "GasBoilers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalData_GasBoilerId",
                table: "HistoricalData",
                column: "GasBoilerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alarms");

            migrationBuilder.DropTable(
                name: "BuildingObjects");

            migrationBuilder.DropTable(
                name: "HistoricalData");

            migrationBuilder.DropTable(
                name: "SystemParameters");

            migrationBuilder.DropTable(
                name: "GasBoilers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
