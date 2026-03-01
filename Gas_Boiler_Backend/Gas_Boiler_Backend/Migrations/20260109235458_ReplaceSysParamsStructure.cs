using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceSysParamsStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SystemParameters",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "Description",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "ParameterName",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "SystemParameters");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SystemParameters",
                newName: "LastUpdated");

            migrationBuilder.RenameColumn(
                name: "Unit",
                table: "SystemParameters",
                newName: "UpdatedBy");

            migrationBuilder.AddColumn<decimal>(
                name: "CeilingUValue",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "FloorUValue",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GasPricePerKwh",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GroundTemp",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OutdoorDesignTemp",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WallUValue",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WindowUValue",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "SystemParameters",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CeilingUValue", "FloorUValue", "GasPricePerKwh", "GroundTemp", "OutdoorDesignTemp", "UpdatedBy", "WallUValue", "WindowUValue" },
                values: new object[] { 0.25m, 0.40m, 0.0055m, 10.0m, -15.0m, "System", 0.50m, 1.40m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CeilingUValue",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "FloorUValue",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "GasPricePerKwh",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "GroundTemp",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "OutdoorDesignTemp",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "WallUValue",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "WindowUValue",
                table: "SystemParameters");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SystemParameters",
                newName: "Unit");

            migrationBuilder.RenameColumn(
                name: "LastUpdated",
                table: "SystemParameters",
                newName: "UpdatedAt");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "SystemParameters",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ParameterName",
                table: "SystemParameters",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Value",
                table: "SystemParameters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.UpdateData(
                table: "SystemParameters",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "ParameterName", "Unit", "Value" },
                values: new object[] { "Average ground temperature", "GroundTemperature", "°C", 10.0 });

            migrationBuilder.InsertData(
                table: "SystemParameters",
                columns: new[] { "Id", "Description", "ParameterName", "Unit", "UpdatedAt", "Value" },
                values: new object[] { 2, "Price of natural gas per kWh", "GasPricePerKWh", "RSD/kWh", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 5.5 });
        }
    }
}
