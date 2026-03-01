using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gas_Boiler_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedHeightToBuildingObject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Height",
                table: "BuildingObjects",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Height",
                table: "BuildingObjects");
        }
    }
}
