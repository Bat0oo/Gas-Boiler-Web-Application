using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreSysParams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DefaultBoilerEfficiency",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SafetyFactor",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WindowToWallRatio",
                table: "SystemParameters",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "SystemParameters",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DefaultBoilerEfficiency", "SafetyFactor", "WindowToWallRatio" },
                values: new object[] { 0.90m, 1.15m, 0.15m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultBoilerEfficiency",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "SafetyFactor",
                table: "SystemParameters");

            migrationBuilder.DropColumn(
                name: "WindowToWallRatio",
                table: "SystemParameters");
        }
    }
}
