using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddParamsToSysParametersForTemperature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OutdoorInfluenceFactor",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TemperatureTimeStepSeconds",
                table: "SystemParameters",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ThermalMassCoefficient",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "SystemParameters",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "OutdoorInfluenceFactor", "TemperatureTimeStepSeconds", "ThermalMassCoefficient" },
                values: new object[] { 0.15m, 60, 1200.0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OutdoorInfluenceFactor",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "TemperatureTimeStepSeconds",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "ThermalMassCoefficient",
                table: "SystemParameters");
        }
    }
}
