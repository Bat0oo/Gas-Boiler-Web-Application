using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceOldAlarmSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alarms_GasBoilers_GasBoilerId",
                table: "Alarms");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Alarms",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "IsResolved",
                table: "Alarms",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "GasBoilerId",
                table: "Alarms",
                newName: "BuildingId");

            migrationBuilder.RenameColumn(
                name: "AlarmType",
                table: "Alarms",
                newName: "Type");

            migrationBuilder.RenameIndex(
                name: "IX_Alarms_IsResolved",
                table: "Alarms",
                newName: "IX_Alarms_IsActive");

            migrationBuilder.RenameIndex(
                name: "IX_Alarms_GasBoilerId",
                table: "Alarms",
                newName: "IX_Alarms_BuildingId");

            migrationBuilder.AddColumn<DateTime>(
                name: "AcknowledgedAt",
                table: "Alarms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "Alarms",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAcknowledged",
                table: "Alarms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "Alarms",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "AlarmSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HighIndoorTempThreshold = table.Column<double>(type: "float", nullable: false),
                    LowIndoorTempThreshold = table.Column<double>(type: "float", nullable: false),
                    HighOutdoorTempThreshold = table.Column<double>(type: "float", nullable: false),
                    LowOutdoorTempThreshold = table.Column<double>(type: "float", nullable: false),
                    HighDailyCostThreshold = table.Column<double>(type: "float", nullable: false),
                    CapacityDeficitThreshold = table.Column<double>(type: "float", nullable: false),
                    AlertCooldownMinutes = table.Column<int>(type: "int", nullable: false),
                    CapacityAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    HighIndoorTempAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LowIndoorTempAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    HighOutdoorTempAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LowOutdoorTempAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    HighCostAlertsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlarmSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AlarmSettings",
                columns: new[] { "Id", "AlertCooldownMinutes", "CapacityAlertsEnabled", "CapacityDeficitThreshold", "HighCostAlertsEnabled", "HighDailyCostThreshold", "HighIndoorTempAlertsEnabled", "HighIndoorTempThreshold", "HighOutdoorTempAlertsEnabled", "HighOutdoorTempThreshold", "LastUpdated", "LowIndoorTempAlertsEnabled", "LowIndoorTempThreshold", "LowOutdoorTempAlertsEnabled", "LowOutdoorTempThreshold", "UpdatedBy" },
                values: new object[] { 1, 60, true, 0.0, false, 50.0, true, 28.0, true, 35.0, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, 18.0, true, -15.0, "System" });

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_CreatedAt",
                table: "Alarms",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_Type_BuildingId_CreatedAt",
                table: "Alarms",
                columns: new[] { "Type", "BuildingId", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Alarms_BuildingObjects_BuildingId",
                table: "Alarms",
                column: "BuildingId",
                principalTable: "BuildingObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alarms_BuildingObjects_BuildingId",
                table: "Alarms");

            migrationBuilder.DropTable(
                name: "AlarmSettings");

            migrationBuilder.DropIndex(
                name: "IX_Alarms_CreatedAt",
                table: "Alarms");

            migrationBuilder.DropIndex(
                name: "IX_Alarms_Type_BuildingId_CreatedAt",
                table: "Alarms");

            migrationBuilder.DropColumn(
                name: "AcknowledgedAt",
                table: "Alarms");

            migrationBuilder.DropColumn(
                name: "Details",
                table: "Alarms");

            migrationBuilder.DropColumn(
                name: "IsAcknowledged",
                table: "Alarms");

            migrationBuilder.DropColumn(
                name: "Severity",
                table: "Alarms");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Alarms",
                newName: "AlarmType");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Alarms",
                newName: "IsResolved");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Alarms",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "BuildingId",
                table: "Alarms",
                newName: "GasBoilerId");

            migrationBuilder.RenameIndex(
                name: "IX_Alarms_IsActive",
                table: "Alarms",
                newName: "IX_Alarms_IsResolved");

            migrationBuilder.RenameIndex(
                name: "IX_Alarms_BuildingId",
                table: "Alarms",
                newName: "IX_Alarms_GasBoilerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alarms_GasBoilers_GasBoilerId",
                table: "Alarms",
                column: "GasBoilerId",
                principalTable: "GasBoilers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
